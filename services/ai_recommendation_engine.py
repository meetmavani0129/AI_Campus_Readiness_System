"""AI Recommendation Engine

This module is a lightweight orchestrator that provides recommendations
for courses and internships based on a student's skill gaps.
"""

from typing import List, Dict

from course_recommender import get_course_recommendations
from internship_recommender import get_internship_recommendations


def generate_recommendations(missing_skills: List[str]) -> Dict[str, List[Dict]]:
    """Generate course and internship recommendations based on missing skills."""
    courses = get_course_recommendations(missing_skills)
    internships = get_internship_recommendations(missing_skills)

    return {
        "courses": courses,
        "internships": internships,
    }
