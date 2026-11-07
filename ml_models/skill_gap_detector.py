"""
Skill Gap Detector Module
-------------------------
Compares a student's current skill set against the industry requirements 
for their recommended domain.
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))
from skills_db import INDUSTRY_SKILLS
from courses_db import COURSES_DB

def analyze_skill_gap(student_skills: str, target_domain: str):
    """
    Analyzes missing skills and provides highly accurate training path suggestions,
    drawing direct course references from COURSES_DB.
    
    Args:
        student_skills (str): Comma separated list of skills.
        target_domain (str): The domain recommended by the ML model.
        
    Returns:
        dict: Missing skills list and specific textual training path suggestion.
    """
    if not student_skills:
        student_set = set()
    else:
        # Normalize: strip, lowercase
        student_set = {s.strip().lower() for s in student_skills.split(',') if s.strip()}
        
    target_domains = [d.strip() for d in target_domain.replace('&', ',').split(',')]
    
    industry_reqs = set()
    for d in target_domains:
        industry_reqs.update(INDUSTRY_SKILLS.get(d, INDUSTRY_SKILLS.get("Software Engineering", [])))
    
    # Calculate missing
    missing_skills = list(industry_reqs - student_set)
    missing_skills.sort()
    
    # Build highly precise Suggestion array
    if not missing_skills:
        suggestion = [f"Excellent! You have all the core skills required for entry-level {target_domain} roles."]
    else:
        # Look up exact courses for the top 2 missing skills
        found_courses = []
        for missing_skill in missing_skills[:2]:
            skill_key = missing_skill.lower()
            if skill_key in COURSES_DB and COURSES_DB[skill_key]:
                # Grab the top recommended course for this skill
                course = COURSES_DB[skill_key][0]
                found_courses.append({
                    "skill": missing_skill.title(),
                    "name": course["name"],
                    "platform": course["platform"],
                    "duration": course["duration"]
                })
        
        # Format paragraph dynamically based on found exact paths
        formatted_names = ", ".join([s.title() for s in missing_skills[:4]])
        if len(missing_skills) > 4:
            formatted_names += ", and others"
            
        base_intro = f"To become fully competitive for {target_domain} roles, you'll need to develop proficiency in {formatted_names}."
        
        if len(found_courses) == 0:
            # Fallback if specific courses weren't mapped
            if len(missing_skills) <= 2:
                suggestion = [
                    base_intro,
                    "Focus your upcoming study sessions on mastering these specific tools.",
                    "We highly recommend seeking out Intermediate-level project tutorials online."
                ]
            else:
                suggestion = [
                    base_intro,
                    "Don't worry—building these skills takes time!",
                    f"A great first step is enrolling in a Beginner Bootcamp for {missing_skills[0].title()} to establish a strong foundation."
                ]
        elif len(found_courses) == 1:
            c1 = found_courses[0]
            suggestion = [
                base_intro,
                f"Your best starting point is the '{c1['name']}' course available on {c1['platform']}.",
                f"Dedicating about {c1['duration']} to this will successfully bridge your gap in {c1['skill']}!"
            ]
        else: # Found 2 exact courses
            c1 = found_courses[0]
            c2 = found_courses[1]
            suggestion = [
                base_intro,
                f"Begin by tackling '{c1['name']}' on {c1['platform']} (approx. {c1['duration']}) to master {c1['skill']}.",
                f"Once you've secured that foundation, level up with '{c2['name']}' on {c2['platform']} ({c2['duration']}) to conquer {c2['skill']}."
            ]
        
    return {
        "missing_skills": [skill.title() for skill in missing_skills], # Title case for UI
        "suggestions": suggestion
    }

if __name__ == '__main__':
    # Test
    print(analyze_skill_gap("Python, Basic SQL, Git", "Data Science"))
    print(analyze_skill_gap("HTML, css", "Web Development"))
