from datetime import datetime
import os
import sys
import io
import csv
import numpy as np
from flask import Blueprint, request, jsonify, Response
from werkzeug.security import check_password_hash, generate_password_hash

# Support module/script execution from both package and script contexts
try:
    from .database import db
    from .models import (
        Assessment,
        Recommendation,
        SkillProfile,
        User,
        PredictionResult,
    )
except ImportError:
    # When running `python app.py` directly (not as a package), fall back to absolute imports.
    from database import db  # type: ignore
    from models import (  # type: ignore
        Assessment,
        Recommendation,
        SkillProfile,
        User,
        PredictionResult,
    )

# Ensure ml_models are importable from the backend package
sys.path.append(os.path.join(os.path.dirname(__file__), '../ml_models'))
from readiness_model import predict_readiness
from domain_prediction import predict_domain
from placement_predictor import predict_placement
from skill_gap_detector import analyze_skill_gap
from course_recommender import get_course_recommendations

from features.career_chatbot import CareerChatbot
from features.resume_analyzer import ResumeAnalyzer

api_bp = Blueprint('api', __name__)
chatbot = CareerChatbot()


def _to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _parse_skills(skills_input):
    if not skills_input:
        return []
    if isinstance(skills_input, list):
        return [str(s).strip() for s in skills_input if str(s).strip()]
    return [s.strip() for s in str(skills_input).split(',') if s.strip()]


def _derive_assessment_from_profile(user: User):
    """Generate suggested assessment values from existing user profile."""
    # Start with base values
    cgpa = user.cgpa or 6.5
    year = user.year_of_study or 1
    degree = (user.degree or '').lower()

    # Basic scaling
    programming = min(100, max(40, int((cgpa / 10) * 80 + year * 2)))
    technical = min(100, max(35, int((cgpa / 10) * 70 + year * 3)))
    communication = min(100, max(40, int(50 + (year - 1) * 5)))
    aptitude = min(100, max(40, int((cgpa / 10) * 75 + year * 2)))

    # Degree-based boosts
    if 'computer' in degree or 'cs' in degree or 'software' in degree:
        programming = min(100, programming + 10)
    if 'data' in degree or 'analytics' in degree:
        aptitude = min(100, aptitude + 10)
    if 'business' in degree or 'management' in degree:
        communication = min(100, communication + 10)

    return {
        'cgpa': float(cgpa),
        'programming': programming,
        'technical': technical,
        'communication': communication,
        'aptitude': aptitude,
        'projects': 0,
        'internships': 0,
        'certifications': 0,
    }


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "message": "Backend is running"}), 200


@api_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user."""
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "university": user.university,
                "degree": user.degree,
                "year_of_study": user.year_of_study,
                "role": user.role,
            },
        }), 200

    return jsonify({"status": "error", "message": "Invalid email or password"}), 401


@api_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.json or {}
    required_fields = ['name', 'email', 'university', 'degree', 'year_of_study', 'password']

    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_password = generate_password_hash(data['password'])

    # Role defaults to Student, but will accept Admin if explicitly passed.
    role = data.get('role', 'Student')
    if role not in ('Student', 'Admin'):
        role = 'Student'

    user = User(
        name=data['name'],
        email=data['email'],
        university=data['university'],
        degree=data['degree'],
        year_of_study=_to_int(data['year_of_study'], 1),
        password_hash=hashed_password,
        role=role,
    )

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({"status": "success", "message": "User registered successfully", "user_id": user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/students/<int:user_id>', methods=['GET'])
def get_student_profile(user_id):
    """Retrieve a student's profile and latest analysis."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    latest_assessment = (
        Assessment.query.filter_by(user_id=user_id).order_by(Assessment.created_at.desc()).first()
    )
    latest_prediction = (
        PredictionResult.query.filter_by(user_id=user_id).order_by(PredictionResult.timestamp.desc()).first()
    )

    suggested_assessment = _derive_assessment_from_profile(user)

    profile = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "university": user.university,
        "degree": user.degree,
        "year_of_study": user.year_of_study,
        "cgpa": user.cgpa,
        "suggested_assessment": suggested_assessment,
        "latest_assessment": {
            "cgpa": latest_assessment.cgpa if latest_assessment else None,
            "programming": latest_assessment.programming_score if latest_assessment else None,
            "technical": latest_assessment.technical_score if latest_assessment else None,
            "communication": latest_assessment.communication_score if latest_assessment else None,
            "aptitude": latest_assessment.aptitude_score if latest_assessment else None,
            "projects": latest_assessment.projects if latest_assessment else None,
            "internships": latest_assessment.internships if latest_assessment else None,
            "certifications": latest_assessment.certifications if latest_assessment else None,
            "created_at": latest_assessment.created_at.isoformat() if latest_assessment else None,
        },
        "latest_prediction": {
            "readiness_score": latest_prediction.readiness_score if latest_prediction else None,
            "domain": latest_prediction.domain_suggested if latest_prediction else None,
            "placement_probability": latest_prediction.placement_probability if latest_prediction else None,
            "timestamp": latest_prediction.timestamp.isoformat() if latest_prediction else None,
        },
    }

    return jsonify({"status": "success", "profile": profile}), 200


@api_bp.route('/students/<int:user_id>', methods=['PUT'])
def update_student_profile(user_id):
    """Update basic student profile details."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    data = request.json or {}

    # Allow updating a subset of fields
    for field in ['name', 'university', 'degree']:
        if data.get(field):
            setattr(user, field, data[field])

    if 'year_of_study' in data:
        user.year_of_study = _to_int(data.get('year_of_study'), user.year_of_study)
    if 'cgpa' in data:
        user.cgpa = _to_float(data.get('cgpa'), user.cgpa)

    try:
        db.session.commit()
        return jsonify({"status": "success", "message": "Profile updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/assessments', methods=['POST'])
def submit_assessment():
    """Submit assessment data and receive AI predictions."""
    data = request.json or {}

    user_id = _to_int(data.get('user_id'), None)
    if not user_id:
        return jsonify({"status": "error", "message": "user_id is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Normalize and map input fields
    cgpa = _to_float(data.get('cgpa', user.cgpa or 7.0), 7.0)
    programming = _to_int(data.get('programming', 60))
    technical = _to_int(data.get('technical', 60))
    communication = _to_int(data.get('communication', 60))
    aptitude = _to_int(data.get('aptitude', 70))
    projects = _to_int(data.get('projects', 0))
    internships = _to_int(data.get('internships', 0))
    certifications = _to_int(data.get('certifications', 0))
    skills = _parse_skills(data.get('skills', []))
    target_domain_override = data.get('target_domain')
    
    if not target_domain_override and skills:
        analyzer = ResumeAnalyzer()
        extracted_dom = analyzer.predict_domain_from_skills(set(s.lower() for s in skills))
        if extracted_dom:
            target_domain_override = extracted_dom

    # Persist assessment record
    assessment = Assessment(
        user_id=user_id,
        cgpa=cgpa,
        programming_score=programming,
        technical_score=technical,
        communication_score=communication,
        aptitude_score=aptitude,
        projects=projects,
        internships=internships,
        certifications=certifications,
    )

    db.session.add(assessment)

    # Update / create detailed skill profile to allow querying later
    skill_profile = SkillProfile.query.filter_by(user_id=user_id).first()
    if skill_profile:
        skill_profile.python_score = programming
        skill_profile.sql_score = technical
        skill_profile.machine_learning_score = aptitude
        skill_profile.web_dev_score = communication
        skill_profile.cloud_score = certifications
        skill_profile.communication_score = communication
    else:
        skill_profile = SkillProfile(
            user_id=user_id,
            python_score=programming,
            sql_score=technical,
            machine_learning_score=aptitude,
            web_dev_score=communication,
            cloud_score=certifications,
            communication_score=communication,
        )
        db.session.add(skill_profile)

    # Update some user fields for convenience
    user.cgpa = cgpa

    # Predict using ML models
    features = {
        'CGPA': cgpa,
        'Programming': programming,
        'Technical': technical,
        'Aptitude': aptitude,
        'Projects': projects,
        'Internships': internships,
        'Certifications': certifications,
        'Communication': communication,
    }

    readiness_score, readiness_category = predict_readiness(features)
    recommended_domain_ml, domain_confidence, domain_distribution_dict = predict_domain(features)

    recommended_domain = target_domain_override if target_domain_override else recommended_domain_ml
    if target_domain_override:
        domain_confidence = 100.0  # High confidence since it was explicitly extracted/provided


    placement_features = {
        'CGPA': cgpa,
        'Coding_Ability': programming,
        'Technical_Score': technical,
        'Communication_Score': communication,
        'Projects': projects,
        'Internships': internships,
    }
    placement_probability = predict_placement(placement_features)

    # Skill gap
    skill_gap_report = analyze_skill_gap(
        ','.join(skills),
        recommended_domain,
    )

    # Course recommendations
    recommended_courses = get_course_recommendations(skill_gap_report.get('missing_skills', []))

    # Save prediction results to history
    prediction_record = PredictionResult(
        user_id=user_id,
        readiness_score=readiness_score,
        domain_suggested=recommended_domain,
        placement_probability=placement_probability,
    )
    db.session.add(prediction_record)

    # Persist recommendations
    for course in recommended_courses:
        rec = Recommendation(
            user_id=user_id,
            type='course',
            title=course.get('name', ''),
            platform=course.get('platform'),
            details=f"Skill target: {course.get('target_skill')}",
            url=course.get('url', ''),
        )
        db.session.add(rec)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

    # Build response
    response = {
        "status": "success",
        "analysis": {
            "readiness_score": int(readiness_score),
            "readiness_category": readiness_category,
            "recommended_domain": recommended_domain,
            "domain_confidence": domain_confidence,
            "placement_probability": placement_probability,
            "skill_gap": skill_gap_report,
            "recommended_courses": recommended_courses,
            "charts": {
                "domain_distribution": domain_distribution_dict,
            },
        },
    }

    return jsonify(response), 200


@api_bp.route('/predict', methods=['POST'])
def predict():
    """Run ML analysis without forcing a saved assessment record."""
    data = request.json or {}

    cgpa = _to_float(data.get('cgpa', 7.0), 7.0)
    programming = _to_int(data.get('programming', 60))
    technical = _to_int(data.get('technical', 60))
    communication = _to_int(data.get('communication', 60))
    aptitude = _to_int(data.get('aptitude', 70))
    projects = _to_int(data.get('projects', 0))
    internships = _to_int(data.get('internships', 0))
    certifications = _to_int(data.get('certifications', 0))
    skills = _parse_skills(data.get('skills', []))
    target_domain_override = data.get('target_domain')
    
    if not target_domain_override and skills:
        analyzer = ResumeAnalyzer()
        extracted_dom = analyzer.predict_domain_from_skills(set(s.lower() for s in skills))
        if extracted_dom:
            target_domain_override = extracted_dom

    features = {
        'CGPA': cgpa,
        'Programming': programming,
        'Technical': technical,
        'Aptitude': aptitude,
        'Projects': projects,
        'Internships': internships,
        'Certifications': certifications,
        'Communication': communication,
    }

    readiness_score, readiness_category = predict_readiness(features)
    recommended_domain_ml, domain_confidence, domain_distribution_dict = predict_domain(features)

    recommended_domain = target_domain_override if target_domain_override else recommended_domain_ml
    if target_domain_override:
        domain_confidence = 100.0


    placement_features = {
        'CGPA': cgpa,
        'Coding_Ability': programming,
        'Technical_Score': technical,
        'Communication_Score': communication,
        'Projects': projects,
        'Internships': internships,
    }
    placement_probability = predict_placement(placement_features)

    # Generate custom Placement Feedback (List format)
    placement_feedback = []
    if placement_probability >= 80:
        placement_feedback = [
            "You are fully capable for placement!",
            "Your profile is highly competitive.",
            "Keep practicing mock interviews to stay sharp."
        ]
    elif placement_probability >= 60:
        placement_feedback = [
            "You have a solid foundation but need to improve specific areas."
        ]
        if cgpa < 7.5: placement_feedback.append("Focus on boosting your CGPA.")
        if programming < 70: placement_feedback.append("Practice advanced coding problems and Data Structures.")
        if projects < 2: placement_feedback.append("Build more full-stack or practical projects.")
        if len(placement_feedback) == 1: placement_feedback.append("Try to gain some internship experience to stand out.")
    else:
        placement_feedback = [
            "You are currently not ready for top-tier placements.",
            "Start with the beginner recommended courses below.",
            "Focus heavily on core programming foundations.",
            "Build at least 2 hands-on practical projects before applying."
        ]

    skill_gap_report = analyze_skill_gap(','.join(skills), recommended_domain)
    recommended_courses = get_course_recommendations(skill_gap_report.get('missing_skills', []))

    # ── Persist to DB if user_id provided (enables Skill Progress Tracker) ──
    user_id = _to_int(data.get('user_id'), None)
    if user_id:
        try:
            user = User.query.get(user_id)
            if user:
                # Save prediction result to history
                pred_record = PredictionResult(
                    user_id=user_id,
                    readiness_score=float(readiness_score),
                    domain_suggested=recommended_domain,
                    placement_probability=float(placement_probability),
                )
                db.session.add(pred_record)

                # Also save/update assessment record
                assessment = Assessment(
                    user_id=user_id,
                    cgpa=cgpa,
                    programming_score=programming,
                    technical_score=technical,
                    communication_score=communication,
                    aptitude_score=aptitude,
                    projects=projects,
                    internships=internships,
                    certifications=certifications,
                )
                db.session.add(assessment)

                # Update user CGPA
                user.cgpa = cgpa

                db.session.commit()
        except Exception as db_err:
            db.session.rollback()
            print(f"[WARN] /predict DB save failed (non-fatal): {db_err}")

    resp = {
        "readiness_score": int(readiness_score),
        "readiness_category": readiness_category,
        "recommended_domain": recommended_domain,
        "domain_confidence": domain_confidence,
        "placement_probability": placement_probability,
        "placement_feedback": placement_feedback,
        "skill_gap": skill_gap_report,
        "recommended_courses": recommended_courses,
        "chart_data": {
            "radar": [programming, max(programming - 10, 50), technical, max(technical - 20, 40), communication, int(min((cgpa / 10) * 100, 100))],
            "domain_dist": [
                domain_distribution_dict.get("Software Development", 0),
                domain_distribution_dict.get("Data Science", 0),
                domain_distribution_dict.get("Web Development", 0),
                domain_distribution_dict.get("Cloud and DevOps", 0),
                domain_distribution_dict.get("Cybersecurity", 0),
            ],
        },
    }

    return jsonify(resp), 200


@api_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Return saved recommendations for a user."""
    user_id = _to_int(request.args.get('user_id'), None)
    if not user_id:
        return jsonify({"status": "error", "message": "user_id query parameter is required"}), 400

    recs = Recommendation.query.filter_by(user_id=user_id).order_by(Recommendation.created_at.desc()).all()
    rec_list = [
        {
            "type": r.type,
            "title": r.title,
            "platform": r.platform,
            "details": r.details,
            "url": r.url,
            "created_at": r.created_at.isoformat(),
        }
        for r in recs
    ]

    return jsonify({"status": "success", "recommendations": rec_list}), 200


@api_bp.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Simple career advice chatbot endpoint."""
    data = request.json or {}
    query = data.get('query', '')
    if not query:
        return jsonify({"status": "error", "message": "query is required"}), 400

    answer = chatbot.get_response(query)
    return jsonify({"status": "success", "query": query, "answer": answer}), 200


@api_bp.route('/cover-letter', methods=['POST'])
def generate_cover_letter():
    """Generate an AI cover letter."""
    data = request.json or {}
    name = data.get('name', 'Student')
    company = data.get('company', 'the company')
    role = data.get('role', 'the position')
    domain = data.get('domain', 'Software Engineering')
    skills = data.get('skills', 'relevant skills')
    
    prompt = f"Please write a professional, 3-paragraph cover letter for {name} applying to {company} for a {role} position in the {domain} domain. Mention these skills: {skills}."
    
    try:
        # Use existing NLP chatbot logic to simulate AI generation
        answer = chatbot.get_response(prompt)
        # If chatbot doesn't generate a good response (e.g. fallback rules), provide a strong default template
        if len(answer) < 100 or "I am an AI" in answer:
            answer = f"Dear Hiring Manager at {company},\n\nI am writing to express my strong interest in the {role} position. As a dedicated student with a focus on {domain}, I have developed a solid foundation in {skills}. I am confident that my academic background and passion for technology make me a strong candidate for this role.\n\nThroughout my studies, I have consistently sought out opportunities to apply my knowledge to real-world problems. My coursework and projects have equipped me with both the technical expertise and the problem-solving mindset necessary to thrive at {company}.\n\nI am eager to bring my skills to your team and contribute to your ongoing success. Thank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.\n\nSincerely,\n{name}"
            
        return jsonify({"status": "success", "cover_letter": answer}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/github-analyze/<username>', methods=['GET'])
def analyze_github(username):
    """Fetch and analyze public GitHub profile."""
    import urllib.request
    import json
    
    try:
        url = f"https://api.github.com/users/{username}/repos?per_page=100"
        req = urllib.request.Request(url, headers={'User-Agent': 'AI-Campus-Readiness'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        langs = {}
        total_stars = 0
        
        for repo in data:
            if repo.get('fork'): continue
            lang = repo.get('language')
            if lang:
                langs[lang] = langs.get(lang, 0) + 1
            total_stars += repo.get('stargazers_count', 0)
            
        top_languages = sorted(langs.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return jsonify({
            "status": "success",
            "stats": {
                "public_repos": len(data),
                "total_stars": total_stars,
                "top_languages": [l[0] for l in top_languages]
            }
        }), 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return jsonify({"status": "error", "message": "GitHub user not found"}), 404
        return jsonify({"status": "error", "message": f"GitHub API error: {e.code}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/analysis/resume', methods=['POST'])
def analyze_resume():
    """Analyze resume text and return skill match + gaps and contact/education insights."""
    from features.resume_analyzer import ResumeAnalyzer

    payload = request.json or {}
    resume_text = payload.get('resume_text', '')
    target_domain = payload.get('target_domain', 'Data Science')

    if not resume_text:
        return jsonify({"status": "error", "message": "resume_text is required"}), 400

    analyzer = ResumeAnalyzer()
    analysis = analyzer.analyze(resume_text, target_domain)

    return jsonify({"status": "success", "analysis": analysis}), 200


@api_bp.route('/users/<int:user_id>/export', methods=['GET'])
def export_user_data(user_id):
    """Export all user data as a consolidated JSON payload."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Fetch all relational data
    preds = PredictionResult.query.filter_by(user_id=user_id).all()
    assms = Assessment.query.filter_by(user_id=user_id).all()
    skills = SkillProfile.query.filter_by(user_id=user_id).first()
    recs = Recommendation.query.filter_by(user_id=user_id).all()

    export_payload = {
        "profile": {
            "name": user.name,
            "email": user.email,
            "university": user.university,
            "degree": user.degree,
            "year_of_study": user.year_of_study,
            "role": user.role
        },
        "predictions": [
            {
                "ready_score": p.readiness_score,
                "domain": p.domain_suggested,
                "placement_prob": p.placement_probability,
                "date": p.timestamp.isoformat() if p.timestamp else None
            } for p in preds
        ],
        "assessments": [
            {
                "cgpa": a.cgpa,
                "programming": a.programming_score,
                "technical": a.technical_score,
                "aptitude": a.aptitude_score,
                "communication": a.communication_score,
                "date": a.created_at.isoformat() if a.created_at else None
            } for a in assms
        ],
        "skills": {
            "python": skills.python_score if skills else 0,
            "sql": skills.sql_score if skills else 0,
            "machine_learning": skills.machine_learning_score if skills else 0,
            "web_dev": skills.web_dev_score if skills else 0,
            "cloud": skills.cloud_score if skills else 0,
        },
        "recommendations": [
            {"title": r.title, "platform": r.platform, "type": r.type} for r in recs
        ]
    }

    return jsonify({"status": "success", "data": export_payload}), 200


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_account(user_id):
    """Permanently delete a user account and all associated metrics."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    try:
        # Manually delete related records to avoid foreign key constraints
        PredictionResult.query.filter_by(user_id=user_id).delete()
        Assessment.query.filter_by(user_id=user_id).delete()
        SkillProfile.query.filter_by(user_id=user_id).delete()
        Recommendation.query.filter_by(user_id=user_id).delete()
        
        # Delete the root user
        db.session.delete(user)
        db.session.commit()
        return jsonify({"status": "success", "message": "Account successfully deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Error deleting account: {str(e)}"}), 500

@api_bp.route('/admin/students', methods=['GET'])
def admin_get_all_students():
    """Return all student users with their latest assessment and prediction data."""
    try:
        users = User.query.filter_by(role='Student').order_by(User.id.desc()).all()
        result = []
        for user in users:
            latest_assessment = (
                Assessment.query.filter_by(user_id=user.id)
                .order_by(Assessment.created_at.desc()).first()
            )
            latest_prediction = (
                PredictionResult.query.filter_by(user_id=user.id)
                .order_by(PredictionResult.timestamp.desc()).first()
            )
            result.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "university": user.university or "—",
                "degree": user.degree or "—",
                "year_of_study": user.year_of_study or 1,
                "readiness_score": int(latest_prediction.readiness_score) if latest_prediction and latest_prediction.readiness_score else None,
                "domain": latest_prediction.domain_suggested if latest_prediction else "—",
                "placement_probability": round(latest_prediction.placement_probability, 1) if latest_prediction and latest_prediction.placement_probability else None,
                "cgpa": float(latest_assessment.cgpa) if latest_assessment and latest_assessment.cgpa else (float(user.cgpa) if user.cgpa else None),
                "last_assessment": latest_assessment.created_at.isoformat() if latest_assessment else None,
            })
        return jsonify({"status": "success", "students": result, "total": len(result)}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/admin/stats', methods=['GET'])
def admin_get_stats():
    """Return aggregate stats for the admin dashboard."""
    try:
        total_students = User.query.filter_by(role='Student').count()
        total_admins = User.query.filter_by(role='Admin').count()

        all_preds = PredictionResult.query.all()
        avg_score = round(
            sum(p.readiness_score for p in all_preds if p.readiness_score) / len(all_preds), 1
        ) if all_preds else 0

        highly_ready = sum(1 for p in all_preds if p.readiness_score and p.readiness_score >= 80)
        needs_prep = sum(1 for p in all_preds if p.readiness_score and p.readiness_score < 60)

        # Domain breakdown
        domain_counts = {}
        for p in all_preds:
            d = p.domain_suggested or "Unknown"
            domain_counts[d] = domain_counts.get(d, 0) + 1
        top_domain = max(domain_counts, key=domain_counts.get) if domain_counts else "—"

        return jsonify({
            "status": "success",
            "stats": {
                "total_students": total_students,
                "total_admins": total_admins,
                "total_assessments": len(all_preds),
                "avg_readiness_score": avg_score,
                "highly_ready_count": highly_ready,
                "needs_prep_count": needs_prep,
                "top_domain": top_domain,
                "domain_breakdown": domain_counts,
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/users/<int:user_id>/password', methods=['PUT'])
def update_password(user_id):
    """Update a user's password after verifying the current one."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    data = request.json or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({"status": "error", "message": "Both current and new passwords are required"}), 400

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"status": "error", "message": "Current password is incorrect"}), 401

    if len(new_password) < 6:
        return jsonify({"status": "error", "message": "New password must be at least 6 characters"}), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"status": "success", "message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Return top 10 students based on readiness score."""
    try:
        # Get latest prediction for each student
        subquery = db.session.query(
            PredictionResult.user_id,
            db.func.max(PredictionResult.timestamp).label('max_timestamp')
        ).group_by(PredictionResult.user_id).subquery()

        top_preds = db.session.query(PredictionResult).join(
            subquery,
            (PredictionResult.user_id == subquery.c.user_id) &
            (PredictionResult.timestamp == subquery.c.max_timestamp)
        ).join(User).filter(User.role == 'Student').order_by(PredictionResult.readiness_score.desc()).limit(10).all()

        leaderboard = []
        for i, pred in enumerate(top_preds):
            user = User.query.get(pred.user_id)
            leaderboard.append({
                "rank": i + 1,
                "name": user.name,
                "university": user.university or "Unknown",
                "readiness_score": int(pred.readiness_score) if pred.readiness_score else 0,
                "domain": pred.domain_suggested or "Unknown"
            })

        return jsonify({"status": "success", "leaderboard": leaderboard}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/admin/export_csv', methods=['GET'])
def admin_export_csv():
    """Generate and return a CSV file of all student data."""
    try:
        users = User.query.filter_by(role='Student').order_by(User.id.desc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header row
        writer.writerow(['ID', 'Name', 'Email', 'University', 'Degree', 'Year', 'CGPA', 'Readiness Score', 'Target Domain', 'Placement Probability', 'Last Assessment Date'])
        
        for user in users:
            latest_assessment = Assessment.query.filter_by(user_id=user.id).order_by(Assessment.created_at.desc()).first()
            latest_prediction = PredictionResult.query.filter_by(user_id=user.id).order_by(PredictionResult.timestamp.desc()).first()
            
            readiness = int(latest_prediction.readiness_score) if latest_prediction and latest_prediction.readiness_score else 'N/A'
            domain = latest_prediction.domain_suggested if latest_prediction else 'N/A'
            placement = round(latest_prediction.placement_probability, 1) if latest_prediction and latest_prediction.placement_probability else 'N/A'
            cgpa = float(latest_assessment.cgpa) if latest_assessment and latest_assessment.cgpa else (float(user.cgpa) if user.cgpa else 'N/A')
            date = latest_assessment.created_at.strftime("%Y-%m-%d") if latest_assessment else 'N/A'
            
            writer.writerow([user.id, user.name, user.email, user.university or '—', user.degree or '—', user.year_of_study or 1, cgpa, readiness, domain, placement, date])
            
        csv_data = output.getvalue()
        
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=student_readiness_report.csv"}
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    """Handle PDF resume upload and return extracted ML features."""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"status": "error", "message": "Only PDF files are supported"}), 400
        
    try:
        from features.pdf_extractor import parse_pdf_resume
        from features.resume_analyzer import ResumeAnalyzer
        # Extract features directly from the file stream in memory
        extracted_data = parse_pdf_resume(file.stream)
        
        if not extracted_data:
            return jsonify({
                "status": "error", 
                "message": "Failed to extract text from the PDF. The file might be scanned or encrypted."
            }), 400
            
        return jsonify({
            "status": "success",
            "message": "PDF analyzed successfully" if extracted_data["is_valid"] else "Extracted partial data. Please verify and fill in the missing fields.",
            "data": extracted_data
        }), 200
        
    except Exception as e:
        print(f"Error processing PDF upload: {e}")
        return jsonify({"status": "error", "message": f"Server error processing PDF: {str(e)}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
# NEW FEATURES: Progress Tracker, Resume Score, Study Plan, Interview Questions
# ─────────────────────────────────────────────────────────────────────────────

@api_bp.route('/users/<int:user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    """Return full prediction history for skill progress line chart."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    preds = (
        PredictionResult.query
        .filter_by(user_id=user_id)
        .order_by(PredictionResult.timestamp.asc())
        .all()
    )

    history = [
        {
            "date": p.timestamp.strftime("%d %b") if p.timestamp else "Unknown",
            "readiness_score": int(p.readiness_score) if p.readiness_score else 0,
            "placement_probability": round(p.placement_probability, 1) if p.placement_probability else 0,
            "domain": p.domain_suggested or "Unknown",
        }
        for p in preds
    ]

    return jsonify({"status": "success", "history": history, "total": len(history)}), 200


@api_bp.route('/resume-score', methods=['POST'])
def score_resume():
    """Score a resume text across 5 sections and return AI feedback."""
    data = request.json or {}
    resume_data = data.get('resume_data', {})

    scores = {}
    feedback = {}

    # 1. Contact
    name = str(resume_data.get('name', '') or '').strip()
    email = str(resume_data.get('email', '') or '').strip()
    phone = str(resume_data.get('phone', '') or '').strip()
    linkedin = str(resume_data.get('linkedin', '') or '').strip()
    contact_score = 4
    contact_tips = []
    if name: contact_score += 1
    if email: contact_score += 1
    if phone: contact_score += 1
    if linkedin: contact_score += 2
    else: contact_tips.append("Add your LinkedIn profile URL to boost recruiter trust.")
    if not phone: contact_tips.append("Include a phone number for callbacks.")
    scores['contact'] = min(contact_score, 10)
    feedback['contact'] = contact_tips if contact_tips else ["Contact section looks complete!"]

    # 2. Summary
    summary = str(resume_data.get('summary', '') or '').strip()
    summ_score = 0
    summ_tips = []
    if len(summary) > 50:
        summ_score = 7
        if len(summary) > 150: summ_score = 9
    else:
        summ_tips.append("Add a strong 2-3 sentence professional summary.")
    if 'looking for' in summary.lower(): summ_tips.append("Use confident language instead of 'looking for'.")
    scores['summary'] = min(summ_score, 10)
    feedback['summary'] = summ_tips if summ_tips else ["Summary is solid and professional!"]

    # 3. Skills
    skills_raw = resume_data.get('skills', [])
    if isinstance(skills_raw, str):
        skills_list = [s.strip() for s in skills_raw.split(',') if s.strip()]
    else:
        skills_list = list(skills_raw or [])
    skills_score = min(len(skills_list) * 1.2, 10)
    skills_tips = []
    if len(skills_list) < 5: skills_tips.append("List at least 6-8 key technical skills.")
    if len(skills_list) > 15: skills_tips.append("Consider grouping skills by category for readability.")
    scores['skills'] = round(skills_score, 1)
    feedback['skills'] = skills_tips if skills_tips else [f"Good skills coverage with {len(skills_list)} listed skills!"]

    # 4. Experience / Projects
    experience = resume_data.get('experience', [])
    projects = resume_data.get('projects', [])
    exp_count = len(experience) if isinstance(experience, list) else (1 if str(experience or '').strip() else 0)
    proj_count = len(projects) if isinstance(projects, list) else _to_int(projects, 0)
    exp_score = min((exp_count * 2) + (proj_count * 2), 10)
    exp_tips = []
    if exp_count == 0: exp_tips.append("Add any internships, part-time work, or freelance projects.")
    if proj_count < 2: exp_tips.append("Showcase at least 2-3 projects with GitHub links.")
    exp_tips.append("Quantify your impact with numbers (e.g., '40% faster', 'saved 5 hrs/week').")
    scores['experience'] = round(exp_score, 1)
    feedback['experience'] = exp_tips

    # 5. Education
    edu = str(resume_data.get('education', '') or '').strip()
    cgpa_val = _to_float(resume_data.get('cgpa', 0), 0)
    edu_score = 5
    edu_tips = []
    if edu: edu_score += 2
    if cgpa_val > 0: edu_score += 2
    if cgpa_val >= 8.0: edu_score = 10
    elif cgpa_val >= 7.0: edu_score = 9
    elif cgpa_val > 0 and cgpa_val < 6.0: edu_tips.append("If CGPA is below 6.0, emphasize skills and projects more.")
    if not edu: edu_tips.append("Include your degree, university, and graduation year.")
    scores['education'] = min(edu_score, 10)
    feedback['education'] = edu_tips if edu_tips else ["Education section is complete!"]

    overall = round(sum(scores.values()) / len(scores), 1)
    grade = "A+" if overall >= 9 else "A" if overall >= 8 else "B+" if overall >= 7 else "B" if overall >= 6 else "C"
    summary_msg = (
        "Excellent resume! You are highly placement-ready." if overall >= 8 else
        "Good resume with room for improvement in a few areas." if overall >= 6 else
        "Your resume needs significant improvements before sending to employers."
    )

    return jsonify({
        "status": "success",
        "overall_score": overall,
        "grade": grade,
        "summary": summary_msg,
        "section_scores": scores,
        "section_feedback": feedback,
    }), 200


@api_bp.route('/study-plan', methods=['POST'])
def generate_study_plan():
    """Generate a personalized 4-week study plan based on skill gaps."""
    data = request.json or {}
    domain = data.get('domain', 'Software Engineering')
    readiness_score = _to_int(data.get('readiness_score', 50), 50)
    programming = _to_int(data.get('programming', 60), 60)
    communication = _to_int(data.get('communication', 60), 60)

    domain_resources = {
        'Data Science': [
            {'skill': 'Python & NumPy', 'resource': 'Python for Data Science – Coursera', 'url': 'https://www.coursera.org/learn/python-for-applied-data-science-ai', 'duration': '10 hrs'},
            {'skill': 'Pandas & Data Wrangling', 'resource': 'Data Analysis with Pandas – Udemy', 'url': '#', 'duration': '8 hrs'},
            {'skill': 'Machine Learning Fundamentals', 'resource': 'ML by Andrew Ng – Coursera', 'url': 'https://www.coursera.org/learn/machine-learning', 'duration': '15 hrs'},
            {'skill': 'SQL & Databases', 'resource': 'SQL for Data Science – Coursera', 'url': 'https://www.coursera.org/learn/sql-for-data-science', 'duration': '6 hrs'},
        ],
        'Web Development': [
            {'skill': 'HTML & CSS Foundations', 'resource': 'freeCodeCamp Web Dev', 'url': 'https://www.freecodecamp.org/', 'duration': '8 hrs'},
            {'skill': 'JavaScript & ES6+', 'resource': 'JavaScript Algorithms – freeCodeCamp', 'url': 'https://www.freecodecamp.org/', 'duration': '10 hrs'},
            {'skill': 'React.js Fundamentals', 'resource': 'React – The Complete Guide – Udemy', 'url': '#', 'duration': '12 hrs'},
            {'skill': 'Node.js & REST APIs', 'resource': 'Node.js API Masterclass – Udemy', 'url': '#', 'duration': '8 hrs'},
        ],
        'Cloud and DevOps': [
            {'skill': 'Linux & Shell Scripting', 'resource': 'Linux Fundamentals – Linux Foundation', 'url': 'https://training.linuxfoundation.org/', 'duration': '6 hrs'},
            {'skill': 'Docker & Containers', 'resource': 'Docker for Beginners – Udemy', 'url': '#', 'duration': '5 hrs'},
            {'skill': 'AWS Core Services', 'resource': 'AWS Cloud Practitioner – AWS Training', 'url': 'https://aws.amazon.com/training/', 'duration': '10 hrs'},
            {'skill': 'CI/CD Pipelines', 'resource': 'DevOps Fundamentals – edX', 'url': 'https://www.edx.org/', 'duration': '6 hrs'},
        ],
        'Cybersecurity': [
            {'skill': 'Networking Basics (OSI/TCP)', 'resource': 'Networking Fundamentals – Coursera', 'url': 'https://www.coursera.org/', 'duration': '6 hrs'},
            {'skill': 'Linux for Security', 'resource': 'Kali Linux – TryHackMe', 'url': 'https://tryhackme.com/', 'duration': '8 hrs'},
            {'skill': 'Web App Security (OWASP)', 'resource': 'Web Security Academy – PortSwigger', 'url': 'https://portswigger.net/web-security', 'duration': '10 hrs'},
            {'skill': 'Ethical Hacking', 'resource': 'CEH v12 – Udemy', 'url': '#', 'duration': '15 hrs'},
        ],
    }
    resources = domain_resources.get(domain, [
        {'skill': 'Data Structures & Algorithms', 'resource': 'DSA Masterclass – Coursera', 'url': 'https://www.coursera.org/specializations/data-structures-algorithms', 'duration': '10 hrs'},
        {'skill': 'System Design Fundamentals', 'resource': 'System Design Interview – Udemy', 'url': '#', 'duration': '8 hrs'},
        {'skill': 'OOP & Design Patterns', 'resource': 'Object Oriented Design – edX', 'url': 'https://www.edx.org/', 'duration': '5 hrs'},
        {'skill': 'Database Design (SQL)', 'resource': 'SQL & Relational DBs – IBM (edX)', 'url': 'https://www.edx.org/', 'duration': '6 hrs'},
    ])

    weekly_themes = [
        {'week': 1, 'theme': 'Foundation Building', 'focus': 'Core concepts and theory', 'daily_hours': 2, 'icon': 'BookOpen'},
        {'week': 2, 'theme': 'Hands-on Practice', 'focus': 'Labs, exercises, and mini-projects', 'daily_hours': 3, 'icon': 'Code2'},
        {'week': 3, 'theme': 'Project Development', 'focus': 'Build a real project for your portfolio', 'daily_hours': 3, 'icon': 'Rocket'},
        {'week': 4, 'theme': 'Interview Preparation', 'focus': 'Mock interviews, revision, and company research', 'daily_hours': 2, 'icon': 'Target'},
    ]

    weeks = []
    for i, wk in enumerate(weekly_themes):
        tasks = []
        if i < len(resources):
            r = resources[i]
            tasks.append({'task': f"Study: {r['skill']}", 'resource': r['resource'], 'url': r['url'], 'duration': r['duration'], 'type': 'course'})
        if communication < 65 and i == 0:
            tasks.append({'task': 'Watch TED Talks daily (15 mins)', 'resource': 'TED.com', 'url': 'https://www.ted.com/', 'duration': '1.5 hrs', 'type': 'soft_skill'})
        if programming < 60 and i == 1:
            tasks.append({'task': 'Solve 5 LeetCode Easy problems', 'resource': 'LeetCode', 'url': 'https://leetcode.com/', 'duration': '3 hrs', 'type': 'practice'})
        if i == 2:
            tasks.append({'task': f'Build a {domain} portfolio project on GitHub', 'resource': 'GitHub', 'url': 'https://github.com/', 'duration': '6 hrs', 'type': 'project'})
        if i == 3:
            tasks.append({'task': 'Do 3 mock interviews on Pramp', 'resource': 'Pramp', 'url': 'https://www.pramp.com/', 'duration': '2 hrs', 'type': 'interview'})
            tasks.append({'task': 'Update LinkedIn & apply to 5 companies', 'resource': 'LinkedIn', 'url': 'https://www.linkedin.com/', 'duration': '1 hr', 'type': 'career'})
        weeks.append({**wk, 'tasks': tasks})

    return jsonify({
        "status": "success",
        "domain": domain,
        "readiness_score": readiness_score,
        "total_weeks": 4,
        "estimated_hours": sum(w['daily_hours'] * 6 for w in weekly_themes),
        "weeks": weeks,
    }), 200


@api_bp.route('/interview-questions', methods=['POST'])
def get_interview_questions():
    """Generate domain-specific mock interview questions with model answers."""
    data = request.json or {}
    domain = data.get('domain', 'Software Engineering')
    count = min(_to_int(data.get('count', 5), 5), 10)

    question_bank = {
        'Data Science': [
            {'q': 'What is the difference between supervised and unsupervised learning?', 'd': 'easy', 'answer': 'Supervised learning uses labeled data where the output is known. Examples: classification (spam detection) and regression. Unsupervised learning finds patterns in unlabeled data. Examples: clustering (K-Means), dimensionality reduction (PCA).', 'tip': 'Give a real-world example for each.'},
            {'q': 'Explain overfitting and how to prevent it.', 'd': 'medium', 'answer': 'Overfitting occurs when a model performs well on training data but poorly on unseen data. Prevention: Use regularization (L1/L2), cross-validation, dropout for neural nets, reduce complexity, or gather more data.', 'tip': 'Mention bias-variance tradeoff.'},
            {'q': 'What is the Central Limit Theorem and why does it matter?', 'd': 'medium', 'answer': 'The CLT states that the distribution of sample means approximates normal distribution as sample size increases, regardless of population distribution. It underpins hypothesis testing and confidence intervals.', 'tip': 'Explain why this enables statistical inference.'},
            {'q': 'How would you handle a highly imbalanced dataset?', 'd': 'hard', 'answer': 'Techniques: (1) Oversampling minority with SMOTE. (2) Undersampling majority. (3) Use class weights in the model. (4) Choose appropriate metrics: F1, AUC-ROC instead of accuracy. (5) Ensemble methods like Balanced Random Forest.', 'tip': 'Always mention evaluation metrics first.'},
            {'q': 'What is the difference between Precision, Recall, and F1 Score?', 'd': 'medium', 'answer': 'Precision = TP/(TP+FP): of all predicted positives, how many are truly positive. Recall = TP/(TP+FN): of all actual positives, how many were caught. F1 = harmonic mean of both, ideal when classes are imbalanced.', 'tip': 'Draw a confusion matrix while explaining.'},
        ],
        'Web Development': [
            {'q': 'What is the difference between REST and GraphQL?', 'd': 'medium', 'answer': 'REST uses fixed endpoints and often over/under-fetches data. GraphQL uses a single endpoint and lets the client request exactly what it needs, reducing over-fetching. GraphQL is better for complex UIs with nested data.', 'tip': 'Give an example from a project if possible.'},
            {'q': 'Explain the JavaScript event loop.', 'd': 'hard', 'answer': 'JavaScript is single-threaded but asynchronous. The event loop checks the call stack; if empty, it moves tasks from the callback/microtask queue into the stack. Microtasks (Promises) run before macrotasks (setTimeout).', 'tip': 'Draw a diagram — it impresses interviewers.'},
            {'q': 'What is the Virtual DOM in React and how does it work?', 'd': 'easy', 'answer': 'The Virtual DOM is an in-memory representation of the real DOM. React updates the Virtual DOM first, runs a diffing algorithm to calculate minimal changes, then updates only those nodes in the real DOM — making UI updates fast.', 'tip': 'Compare it to how jQuery works (direct DOM manipulation).'},
            {'q': 'How does CSS Flexbox differ from CSS Grid?', 'd': 'easy', 'answer': 'Flexbox is one-dimensional (row OR column) — ideal for aligning items within a single axis. CSS Grid is two-dimensional (rows AND columns simultaneously) — use for overall page layouts.', 'tip': 'Draw a quick wireframe to illustrate.'},
            {'q': 'What is CORS and how do you resolve it?', 'd': 'medium', 'answer': 'CORS (Cross-Origin Resource Sharing) is a browser security policy that blocks requests to different origins. Resolve it server-side by setting headers: Access-Control-Allow-Origin. In Flask use flask-cors; in Node use the cors package.', 'tip': 'Mention you have dealt with this in your own projects.'},
        ],
        'Cloud and DevOps': [
            {'q': 'What is the difference between Docker and a Virtual Machine?', 'd': 'easy', 'answer': 'VMs virtualize hardware and run a full guest OS — heavy. Docker containers share the host OS kernel, are lightweight, start in seconds, and are portable. Containers are ideal for microservices.', 'tip': 'Mention specific Docker commands you know.'},
            {'q': 'Explain Infrastructure as Code (IaC).', 'd': 'medium', 'answer': 'IaC manages infrastructure through code (not manual clicks). Tools: Terraform (cloud-agnostic), AWS CloudFormation. Benefits: version control, reproducibility, automation, and reduced human error.', 'tip': 'Mention Terraform if you have used it.'},
            {'q': 'What is a CI/CD pipeline?', 'd': 'easy', 'answer': 'CI (Continuous Integration) automatically tests code on push. CD (Continuous Delivery/Deployment) automatically deploys tested code to production. Tools: Jenkins, GitHub Actions, GitLab CI. Benefits: faster releases, fewer production bugs.', 'tip': 'Describe a pipeline you have set up.'},
            {'q': 'Differences between AWS S3, EC2, and Lambda?', 'd': 'medium', 'answer': 'S3: Object storage for files/images. EC2: Virtual server — full OS control. Lambda: Serverless compute — runs code only on trigger, pay-per-execution. Each serves a different workload type.', 'tip': 'Say when you would choose each one.'},
            {'q': 'How would you secure a cloud application?', 'd': 'hard', 'answer': 'Key steps: (1) IAM least privilege. (2) Encrypt at rest and in transit (TLS). (3) Use VPCs for isolation. (4) Enable logging (CloudTrail). (5) Regular vulnerability scans. (6) MFA for all admin accounts.', 'tip': 'Structure your answer with numbered points.'},
        ],
        'Cybersecurity': [
            {'q': 'What is the difference between symmetric and asymmetric encryption?', 'd': 'easy', 'answer': 'Symmetric uses one key for encrypt and decrypt (e.g., AES) — fast but key-sharing is risky. Asymmetric uses a key pair (e.g., RSA) — public key encrypts, private key decrypts. Used in HTTPS and SSH.', 'tip': 'Mention TLS handshake as a real example.'},
            {'q': 'Explain SQL Injection and how to prevent it.', 'd': 'medium', 'answer': 'SQL Injection inserts malicious SQL into input fields, manipulating DB queries. Prevention: (1) Parameterized queries. (2) Input validation. (3) Use an ORM. (4) Least privilege on DB users.', 'tip': 'Show the malicious query AND the safe version.'},
            {'q': 'What is a Man-in-the-Middle attack?', 'd': 'easy', 'answer': 'Attacker secretly intercepts and possibly alters communication between two parties. Prevention: HTTPS/TLS, certificate pinning, mutual TLS, VPNs on public Wi-Fi.', 'tip': 'Tie your answer back to HTTPS as a real-world defense.'},
            {'q': 'What is the OWASP Top 10?', 'd': 'medium', 'answer': 'OWASP Top 10 lists the most critical web app security risks. Current top issues: Broken Access Control, Cryptographic Failures, Injection (SQL/XSS), Insecure Design, Security Misconfiguration.', 'tip': 'Knowing the top 5 in detail is usually sufficient.'},
            {'q': 'How does a firewall differ from an IDS/IPS?', 'd': 'hard', 'answer': 'Firewall filters traffic by rules (allow/block by IP/port/protocol). IDS monitors and alerts on suspicious activity. IPS can also automatically block detected threats. They work together in layers.', 'tip': 'Describe a layered security architecture.'},
        ],
    }

    questions = question_bank.get(domain, question_bank['Web Development'])
    selected = questions[:count]

    result = [
        {
            'id': i + 1,
            'question': q['q'],
            'difficulty': q['d'],
            'model_answer': q['answer'],
            'interview_tip': q['tip'],
            'domain': domain,
        }
        for i, q in enumerate(selected)
    ]

    return jsonify({
        "status": "success",
        "domain": domain,
        "questions": result,
        "count": len(result),
    }), 200
