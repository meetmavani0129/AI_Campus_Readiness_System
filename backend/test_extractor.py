import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from features.resume_analyzer import ResumeAnalyzer

text = """
HARSHIL ANTALA
Computer Science & Engineering student
OBJECTIVE
A detail-oriented Computer Science graduate seeking an entry-level position in software development or related fields
WORK EXPERIENCE
CreArt Solutions Pvt. Ltd., Ahmedabad
Learned core concepts of React.js and UI building techniques
Explored basic API integration and database connectivity
Worked under the guidance of a Senior Software Developer
CSRBOX
Understood AI concepts through code-based APIs and no-code flow tools
Learned basics of AI model creation and real-world applications
PROJECT
iDiscuss – Online Coding Forum
A PHP and MySQL-based discussion forum where users can post questions and replies under specific categories like Python, Java, and C.
Lockify – Password Manager
Secure password manager built using React and PHP
"""

analyzer = ResumeAnalyzer()
skills = analyzer.extract_skills(text)
print("EXTRACTED SKILLS:", skills)

domain = analyzer.predict_domain_from_skills(skills)
print("PREDICTED DOMAIN:", domain)
