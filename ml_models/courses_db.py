"""
Courses Database
----------------
Maps technical skills to specific online courses from top platforms.
"""

COURSES_DB = {
    # Data Science Skills
    "python": [
        {"name": "Python for Everybody Specialization", "platform": "Coursera", "duration": "8 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/specializations/python"},
        {"name": "100 Days of Code: The Complete Python Pro Bootcamp", "platform": "Udemy", "duration": "60 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/100-days-of-code/"}
    ],
    "sql": [
        {"name": "SQL for Data Science", "platform": "Coursera", "duration": "4 Weeks", "difficulty": "Beginner", "url": "https://www.coursera.org/learn/sql-for-data-science"},
        {"name": "The Ultimate MySQL Bootcamp", "platform": "Udemy", "duration": "20 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/"}
    ],
    "machine learning": [
        {"name": "Machine Learning Specialization by Andrew Ng", "platform": "Coursera", "duration": "3 Months", "difficulty": "Intermediate", "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
        {"name": "Machine Learning A-Z™: AI, Python & R + ChatGPT Prize", "platform": "Udemy", "duration": "42 Hours", "difficulty": "Advanced", "url": "https://www.udemy.com/course/machinelearning/"}
    ],
    "statistics": [
        {"name": "Statistics with Python Specialization", "platform": "Coursera", "duration": "2 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/specializations/statistics-with-python"}
    ],
    "pandas": [
        {"name": "Data Analysis with Pandas and Python", "platform": "Udemy", "duration": "18 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/data-analysis-with-pandas/"}
    ],
    "data visualization": [
        {"name": "Information Visualization Specialization", "platform": "Coursera", "duration": "4 Months", "difficulty": "Intermediate", "url": "https://www.coursera.org/specializations/information-visualization"}
    ],

    # Web Development / Full Stack Skills
    "html": [
        {"name": "HTML, CSS, and Javascript for Web Developers", "platform": "Coursera", "duration": "4 Weeks", "difficulty": "Beginner", "url": "https://www.coursera.org/learn/html-css-javascript-for-web-developers"}
    ],
    "css": [
        {"name": "Advanced CSS and Sass", "platform": "Udemy", "duration": "28 Hours", "difficulty": "Advanced", "url": "https://www.udemy.com/course/advanced-css-and-sass/"}
    ],
    "javascript": [
        {"name": "The Complete JavaScript Course: From Zero to Expert!", "platform": "Udemy", "duration": "68 Hours", "difficulty": "Beginner - Intermediate", "url": "https://www.udemy.com/course/the-complete-javascript-course/"}
    ],
    "react": [
        {"name": "Meta Front-End Developer Professional Certificate", "platform": "Coursera / Meta", "duration": "7 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer"},
        {"name": "React - The Complete Guide (incl Hooks, React Router, Redux)", "platform": "Udemy", "duration": "48 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"}
    ],
    "node.js": [
        {"name": "Node.js, Express, MongoDB & More: The Complete Bootcamp", "platform": "Udemy", "duration": "42 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/"}
    ],
    "api design": [
        {"name": "Designing RESTful APIs", "platform": "Udemy", "duration": "5 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/restful-api-with-node-js/"}
    ],
    "databases": [
        {"name": "Database Management Essentials", "platform": "Coursera", "duration": "7 Weeks", "difficulty": "Intermediate", "url": "https://www.coursera.org/learn/database-management"}
    ],

    # Cybersecurity Skills
    "networking": [
        {"name": "Google IT Support Professional Certificate", "platform": "Coursera / Google", "duration": "6 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/professional-certificates/google-it-support"},
        {"name": "Computer Communications Specialization", "platform": "Coursera", "duration": "4 Months", "difficulty": "Intermediate", "url": "https://www.coursera.org/specializations/computer-communications"}
    ],
    "linux": [
        {"name": "Linux Mastery: Master the Linux Command Line", "platform": "Udemy", "duration": "11 Hours", "difficulty": "Beginner", "url": "https://www.udemy.com/course/linux-mastery-master-the-linux-command-line-in-11-5-hours/"}
    ],
    "security testing": [
        {"name": "IBM Cybersecurity Analyst Professional Certificate", "platform": "Coursera / IBM", "duration": "8 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst"},
        {"name": "Penetration Testing and Ethical Hacking", "platform": "edX", "duration": "5 Weeks", "difficulty": "Intermediate", "url": "https://www.edx.org/course/penetration-testing-and-ethical-hacking"}
    ],
    "cryptography": [
        {"name": "Cryptography I", "platform": "Coursera", "duration": "7 Weeks", "difficulty": "Intermediate", "url": "https://www.coursera.org/learn/crypto"}
    ],
    "ethical hacking": [
        {"name": "Learn Ethical Hacking From Scratch", "platform": "Udemy", "duration": "16 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/"}
    ],

    # Software Engineering / Comp Sci Core
    "java": [
        {"name": "Java Programming and Software Engineering Fundamentals", "platform": "Coursera", "duration": "5 Months", "difficulty": "Beginner", "url": "https://www.coursera.org/specializations/java-programming"}
    ],
    "c++": [
        {"name": "Beginning C++ Programming - From Beginner to Beyond", "platform": "Udemy", "duration": "46 Hours", "difficulty": "Beginner", "url": "https://www.udemy.com/course/beginning-c-plus-plus-programming/"}
    ],
    "data structures": [
        {"name": "Data Structures and Algorithms Specialization", "platform": "Coursera", "duration": "8 Months", "difficulty": "Intermediate", "url": "https://www.coursera.org/specializations/data-structures-algorithms"}
    ],
    "algorithms": [
        {"name": "Algorithms Specialization", "platform": "Coursera", "duration": "4 Months", "difficulty": "Advanced", "url": "https://www.coursera.org/specializations/algorithms"}
    ],
    "system design": [
        {"name": "Grokking the System Design Interview", "platform": "Educative.io", "duration": "20 Hours", "difficulty": "Advanced", "url": "https://www.educative.io/courses/grokking-the-system-design-interview"}
    ],
    "git": [
        {"name": "Version Control with Git", "platform": "Coursera / Atlassian", "duration": "4 Weeks", "difficulty": "Beginner", "url": "https://www.coursera.org/learn/version-control-with-git"}
    ],

    # DevOps Skills
    "docker": [
        {"name": "Docker for the Absolute Beginner - Hands On", "platform": "Udemy", "duration": "5 Hours", "difficulty": "Beginner", "url": "https://www.udemy.com/course/learn-docker/"}
    ],
    "kubernetes": [
        {"name": "Kubernetes for the Absolute Beginners", "platform": "Udemy", "duration": "6 Hours", "difficulty": "Beginner", "url": "https://www.udemy.com/course/learn-kubernetes/"}
    ],
    "ci/cd": [
        {"name": "Continuous Delivery & DevOps", "platform": "Coursera", "duration": "4 Weeks", "difficulty": "Intermediate", "url": "https://www.coursera.org/learn/uva-darden-continous-delivery-devops"}
    ],
    "aws": [
        {"name": "AWS Certified Solutions Architect - Associate", "platform": "Udemy", "duration": "27 Hours", "difficulty": "Intermediate", "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/"}
    ]
}
