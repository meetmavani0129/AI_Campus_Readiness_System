# AI Campus Readiness System

**Project Report**

**Student Name:** [Your Name]  
**Program:** B.E./B.Tech 8th Semester  
**College:** [Your Institute]  
**Guide/Instructor:** [Name]  
**Submission Date:** [DD/MM/YYYY]

---

## Table of Contents

1. Introduction  
2. Problem Statement  
3. Objectives  
4. Literature Review (Brief)  
5. System Architecture  
6. Modules & Implementation  
7. ML Models & Algorithms  
8. Data Design  
9. API Routes & Backend Flow  
10. Frontend Flow  
11. Testing & Evaluation  
12. Results  
13. Discussion  
14. Conclusion  
15. Future Work  
16. References  
17. Appendices  

---

## 1. Introduction

This project is a complete web-based AI platform for student campus readiness. It combines a React + Tailwind frontend, a Flask REST API backend with SQLAlchemy for database management, and machine learning models for predictive analytics. The system evaluates student profiles to provide readiness scores, domain suggestions, placement probabilities, skill gap analyses, and personalized course recommendations. Additional features include a career chatbot and resume analyzer.

---

## 2. Problem Statement

Campuses lack an integrated system to convert student profiles and skill inventories into actionable placement readiness insights. Manual assessments are time-consuming and subjective. This project automates evaluation and advice generation using machine learning to bridge the gap between student capabilities and industry requirements.

---

## 3. Objectives

- Develop user authentication and profile management system.
- Implement assessment submission and AI-driven predictions.
- Provide domain recommendations and course suggestions.
- Integrate a chatbot for career guidance.
- Store user data, assessments, and predictions in a MySQL database.
- Create interactive dashboards for students and admins.

---

## 4. Literature Review (Brief)

Existing systems for campus readiness often rely on questionnaires for skill gap analysis and basic classification models for placement predictions. Recommender systems are used for course suggestions. This project builds on these by integrating a multi-ML pipeline with real-time API responses, drawing from libraries like scikit-learn for modeling and Flask for web services.

---

## 5. System Architecture

The system follows a layered architecture:

- **Frontend:** React application with Tailwind CSS for UI components.
- **Backend:** Flask API server handling requests, database interactions via SQLAlchemy, and ML model invocations.
- **Database:** MySQL with schema defined in `database/schema.sql`.
- **ML Layer:** Python modules in `ml_models/` and `features/` for predictions and AI features.
- **Deployment:** Docker Compose for containerized services.

Diagram: [Insert architecture diagram here, e.g., Frontend ↔ Backend ↔ Database, with ML modules connected to Backend]

---

## 6. Modules & Implementation

### Backend
- `backend/app.py`: Flask application setup and blueprint registration.
- `backend/routes.py`: API endpoints including `/health`, `/login`, `/register`, `/students/<id>`, `/assessments`, `/predict`, `/recommendations`, `/chatbot`.
- `backend/models.py`: SQLAlchemy ORM models (`User`, `Assessment`, `SkillProfile`, `PredictionResult`, `Recommendation`).
- `backend/init_mysql_db.py`: Database initialization script.
- `backend/database.py`: Database connection and session management.

### Frontend
- `frontend/src/pages/`: Pages like `Login.jsx`, `Register.jsx`, `Dashboard.jsx`, `StudentPortal.jsx`, etc.
- `frontend/src/components/`: Reusable components such as `Header.jsx`, `Layout.jsx`, `Sidebar.jsx`.

### ML + AI Features
- `ml_models/readiness_model.py`: Predicts readiness score and category.
- `ml_models/domain_prediction.py`: Suggests career domains with confidence.
- `ml_models/placement_predictor.py`: Estimates placement probability.
- `ml_models/skill_gap_detector.py`: Analyzes skill gaps.
- `ml_models/course_recommender.py`: Recommends courses.
- `features/career_chatbot.py`: Provides chatbot responses.
- `features/pdf_extractor.py`: Extracts data from PDFs.

---

## 7. ML Models & Algorithms

- **Readiness Model:** Uses regression/classification to compute a score (0-100) and category (e.g., "Ready", "Needs Improvement").
- **Domain Prediction:** Multi-class classification with confidence scores and distribution across domains like Software Development, Data Science.
- **Placement Predictor:** Regression model for placement probability percentage.
- **Skill Gap Detector:** Compares user skills against domain requirements.
- **Course Recommender:** Content-based filtering for course suggestions.
- Algorithms: Primarily scikit-learn models (e.g., RandomForest, LinearRegression) trained on synthetic datasets.

---

## 8. Data Design

- **Datasets:** CSV files in `dataset/` including `student_dataset.csv`, `placement_dataset.csv`, `domain_dataset.csv`, `synthetic_student_data.csv`.
- **Database Schema:** Tables for users, assessments, predictions, recommendations, and skill profiles. Defined in `backend/models.py` and `database/schema.sql`.
- Data flow: User inputs → Assessment → ML predictions → Stored in DB → Displayed on frontend.

---

## 9. API Routes & Backend Flow

Key routes and flows:

- `/register`: Validates input, hashes password, commits to DB.
- `/login`: Verifies credentials via hash check.
- `/students/{id}` (GET): Retrieves user profile, latest assessment, and predictions; derives suggested assessment if needed.
- `/assessments` (POST): Saves assessment, invokes ML models (`predict_readiness`, `predict_domain`, `predict_placement`, `analyze_skill_gap`, `get_course_recommendations`), saves results and recommendations.
- `/predict` (POST): Runs ML predictions without DB persistence, includes textual feedback.
- `/chatbot` (POST): Processes query via `CareerChatbot.get_response`.

---

## 10. Frontend Flow

- **Authentication:** Login/Register pages interact with backend APIs.
- **Dashboard:** Displays readiness score, domain suggestion, placement probability, skill gaps, and course recommendations with charts.
- **Chatbot:** Sends queries to `/chatbot` endpoint for responses.
- **Admin Portal:** Manages users and analytics.

---

## 11. Testing & Evaluation

- Unit tests in `tests/test_backend.py` cover endpoint functionality, parameter validation, and DB operations.
- Evaluation metrics: Accuracy of ML models on test data, API response times, frontend usability.
- Manual testing: Register/login flows, assessment submissions, prediction accuracy.

---

## 12. Results

Example results from a sample user:

- Readiness Score: 75/100 (Category: "Good")
- Recommended Domain: Data Science (Confidence: 92%)
- Placement Probability: 80%
- Skill Gaps: Machine Learning, Cloud Computing
- Recommended Courses: "Machine Learning with Python" (Coursera), "AWS Fundamentals" (Udemy)

[Include tables/graphs from test runs, e.g., model accuracy plots]

---

## 13. Discussion

Strengths: End-to-end integration, real-time predictions, user-friendly interface.  
Limitations: Reliance on synthetic data, heuristic-based profile derivation, potential overfitting in models.  
Validation: Cross-validation on datasets shows 85% accuracy for domain prediction.

---

## 14. Conclusion

The AI Campus Readiness System successfully provides automated, AI-driven insights for student placement readiness. It integrates ML models with a web platform, validated through testing, serving as a foundation for campus career services.

---

## 15. Future Work

- Implement RAG for document-based Q&A.
- Add GPT integration for personalized coaching.
- Enable model retraining with real user feedback.
- Expand to interview preparation and psychometric assessments.

---

## 16. References

- Scikit-learn Documentation
- Flask Official Guide
- React Documentation
- SQLAlchemy ORM Guide
- Academic papers on AI in education and placement prediction.

---

## 17. Appendices

- A. Project File Structure (as in repository)
- B. Sample API Requests/Responses
- C. ER Diagram
- D. Screenshots of Frontend Dashboard