"""Course Recommender Service

Provides a thin wrapper around the course database to return
recommendations for a given set of skill gaps.
"""

from typing import List, Dict

# Import from the ML models folder that contains curated course suggestions.
try:
    from ml_models.courses_db import COURSES_DB
except ImportError:
    # Fallback if running from the backend package (path differences)
    from courses_db import COURSES_DB  # type: ignore


def get_course_recommendations(missing_skills: List[str], max_per_skill: int = 1) -> List[Dict]:
    """Return a list of recommended courses based on missing skill keywords."""
    recommended = []
    seen = set()

    for skill in missing_skills:
        skill_key = skill.strip().lower()
        if skill_key in COURSES_DB:
            for course in COURSES_DB[skill_key][:max_per_skill]:
                if course['name'] not in seen:
                    entry = course.copy()
                    entry['target_skill'] = skill.title()
                    recommended.append(entry)
                    seen.add(course['name'])

    return recommended
