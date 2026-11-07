"""
Course Recommender Module
-------------------------
Recommends specific online courses to fill identified skill gaps.
"""

import sys
import os
import random
sys.path.append(os.path.dirname(__file__))

# Import the course database
try:
    from courses_db import COURSES_DB
except ImportError:
    COURSES_DB = {}

def get_course_recommendations(missing_skills: list, max_per_skill=1):
    """
    Given a list of missing skill strings, fetches relevant courses.
    
    Args:
        missing_skills (list): E.g., ['sql', 'machine learning']
        max_per_skill (int): Max courses to recommend per skill to avoid 
                             cluttering the UI. Default is 1.
                             
    Returns:
        list: List of dictionary objects containing course details.
    """
    recommended = []
    seen_courses = set()
    
    for skill in missing_skills:
        skill_clean = skill.strip().lower()
        
        # Check if we have courses for this skill
        if skill_clean in COURSES_DB:
            available_courses = COURSES_DB[skill_clean]
            
            # Select subset based on max per skill (we'll just take the top ones for consistency)
            count = 0
            for course in available_courses:
                if count >= max_per_skill:
                    break
                    
                # Deduplicate by name if multiple skills map to the same overarching course
                if course["name"] not in seen_courses:
                    # Append what skill this course is targeting for UI context
                    course_info = course.copy()
                    course_info["target_skill"] = skill.title()
                    
                    recommended.append(course_info)
                    seen_courses.add(course["name"])
                    count += 1
                    
    return recommended

if __name__ == "__main__":
    # Test
    test_skills = ['machine learning', 'sql', 'missing_skill']
    print(get_course_recommendations(test_skills))
