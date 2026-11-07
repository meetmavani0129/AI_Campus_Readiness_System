"""
Industry Core Skills Database
-----------------------------
Maps target domains to standard industry required skills.
All skills are lowercase for easier matching.
"""

INDUSTRY_SKILLS = {
    "Data Science": [
        "python", "sql", "machine learning", "statistics", 
        "data visualization", "pandas"
    ],
    "Web Development": [
        "html", "css", "javascript", "react", "node.js"
    ],
    "Full Stack": [
        "javascript", "react", "node.js", "databases", "api design", 
        "html", "css", "sql"
    ],
    "Cybersecurity": [
        "networking", "linux", "security testing", "cryptography", 
        "python", "ethical hacking"
    ],
    "Software Engineering": [
        "java", "c++", "data structures", "algorithms", 
        "system design", "git"
    ],
    "DevOps": [
        "linux", "docker", "kubernetes", "ci/cd", 
        "aws", "python"
    ]
}
