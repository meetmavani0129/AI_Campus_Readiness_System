"""Internship Recommender Service

Provides sample internship recommendations based on missing skills.
"""

from typing import List, Dict

# A small catalog of sample internship opportunities.
INTERNSHIP_DATABASE = [
    {
        "title": "Software Engineering Intern",
        "company": "TechBridge Labs",
        "duration": "3 Months",
        "skills": ["python", "git", "api design"],
        "level": "Beginner",
        "url": "https://example.com/internships/software-engineer",
    },
    {
        "title": "Data Science Intern",
        "company": "DataVista",
        "duration": "4 Months",
        "skills": ["python", "machine learning", "sql"],
        "level": "Intermediate",
        "url": "https://example.com/internships/data-science",
    },
    {
        "title": "Cloud DevOps Intern",
        "company": "CloudWorks",
        "duration": "3 Months",
        "skills": ["aws", "docker", "ci/cd"],
        "level": "Intermediate",
        "url": "https://example.com/internships/devops",
    },
    {
        "title": "Web Development Intern",
        "company": "WebLab",
        "duration": "3 Months",
        "skills": ["html", "css", "javascript"],
        "level": "Beginner",
        "url": "https://example.com/internships/web-dev",
    },
]


def get_internship_recommendations(missing_skills: List[str], max_results: int = 3) -> List[Dict]:
    """Return a short list of internship recommendations that match missing skills."""
    missing = {s.strip().lower() for s in missing_skills if s}

    ranked = []
    for internship in INTERNSHIP_DATABASE:
        match_score = len(missing.intersection(set(internship.get('skills', []))))
        if match_score > 0:
            ranked.append((match_score, internship))

    ranked.sort(key=lambda x: x[0], reverse=True)

    return [item for _, item in ranked[:max_results]]
