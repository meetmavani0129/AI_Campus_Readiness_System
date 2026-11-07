import re
from typing import Dict, List, Optional, Set

import spacy

# Load English NLP model (requires: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: en_core_web_sm not found. Downloading...")
    import subprocess

    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
    nlp = spacy.load("en_core_web_sm")


class ResumeAnalyzer:
    def __init__(self):
        # Comprehensive tech skill dictionary based on domains
        self.domain_skills = {
            "Data Science": {
                "python",
                "r",
                "sql",
                "machine learning",
                "deep learning",
                "pandas",
                "numpy",
                "tensorflow",
                "pytorch",
                "statistics",
                "data visualization",
                "tableau",
                "power bi",
                "nlp",
                "scikit-learn",
            },
            "Web Development": {
                "html",
                "css",
                "javascript",
                "react",
                "angular",
                "vue",
                "node.js",
                "express",
                "django",
                "flask",
                "typescript",
                "mongodb",
                "postgresql",
                "api",
                "rest",
                "python",
                "sql",
                "java",
                "php",
                "git",
            },
            "Software Engineering": {
                "java",
                "c++",
                "python",
                "c#",
                "javascript",
                "git",
                "sql",
                "algorithms",
                "data structures",
                "system design",
                "testing",
                "oop",
                "linux",
                "agile",
            },
            "Cloud Computing": {
                "aws",
                "azure",
                "gcp",
                "docker",
                "kubernetes",
                "linux",
                "terraform",
                "ci/cd",
                "jenkins",
                "git",
                "bash",
                "networking",
                "security",
            },
            "Cybersecurity": {
                "kali linux",
                "wireshark",
                "metasploit",
                "penetration testing",
                "cryptography",
                "firewalls",
                "siem",
                "network security",
                "python",
                "bash",
                "c++",
            },
        }

        # Flatten all skills into a single set for fast lookup
        self.all_known_skills = {skill for domain in self.domain_skills.values() for skill in domain}

        # Simple synonym map to help match variations
        self.skill_aliases = {
            "machine-learning": "machine learning",
            "machinelearning": "machine learning",
            "deep-learning": "deep learning",
            "nlp": "nlp",
            "data visualization": "data visualization",
            "visualization": "data visualization",
            "tensorflow": "tensorflow",
            "pytorch": "pytorch",
            "sql": "sql",
            "github": "github",
            "git": "git",
        }

    def _clean_text(self, text: str) -> str:
        """Clean the resume text to improve NLP parsing."""
        text = text.lower()
        # Remove uncommon characters but keep :, @, +, #, & and periods
        text = re.sub(r"[^\w\s\.@\+\#\-&/()\n]", " ", text)
        return text

    def extract_skills(self, resume_text: str) -> Set[str]:
        """Extract technical skills from the resume text using NLP and keyword matching."""
        cleaned_text = self._clean_text(resume_text)
        doc = nlp(cleaned_text)

        extracted_skills: Set[str] = set()

        # 1. Match noun chunks (multi-word skills)
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip()
            if chunk_text in self.all_known_skills:
                extracted_skills.add(chunk_text)

        # 2. Match individual tokens + aliases
        for token in doc:
            token_text = token.text.strip()
            canonical = self.skill_aliases.get(token_text, token_text)
            if canonical in self.all_known_skills:
                extracted_skills.add(canonical)

        # 3. Fallback: regex based skill detection for common patterns
        for skill in self.all_known_skills:
            if skill in cleaned_text and skill not in extracted_skills:
                extracted_skills.add(skill)

        return extracted_skills

    def extract_contact_info(self, resume_text: str) -> Dict[str, Optional[str]]:
        """Extract contact information like email, phone, LinkedIn, and GitHub."""
        text = resume_text
        result = {
            "email": None,
            "phone": None,
            "linkedin": None,
            "github": None,
        }

        # Email
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        if email_match:
            result["email"] = email_match.group(0)

        # Phone number
        phone_match = re.search(
            r"(\+\d{1,3}[\s-])?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}", text
        )
        if phone_match:
            result["phone"] = phone_match.group(0)

        # LinkedIn
        linkedin_match = re.search(r"(https?://)?(www\.)?linkedin\.com/[A-Za-z0-9\-/]+", text)
        if linkedin_match:
            result["linkedin"] = linkedin_match.group(0)

        # GitHub
        github_match = re.search(r"(https?://)?(www\.)?github\.com/[A-Za-z0-9\-]+", text)
        if github_match:
            result["github"] = github_match.group(0)

        return result

    def extract_experience_years(self, resume_text: str) -> Optional[float]:
        """Estimate total years of experience mentioned in the resume."""
        # Find all patterns like "X years" or "X+ years"
        matches = re.findall(r"(\d+(?:\.\d+)?)(?:\+)?\s*(?:years|yrs|year)", resume_text, flags=re.I)
        if not matches:
            return None

        years = [float(m) for m in matches]
        # Use max match as a simple estimate (e.g., "5+ years" -> 5)
        return max(years)

    def extract_education(self, resume_text: str) -> List[str]:
        """Extract education entries (degree + institution) from resume text."""
        text = resume_text
        education_lines: List[str] = []

        # Common degree keywords
        degree_patterns = [
            r"b\.?\s*tech", r"bachelor", r"m\.?\s*tech", r"master", r"ph\.?d", r"mba", r"b\.sc", r"m\.sc",
            r"diploma",
        ]

        for line in text.splitlines():
            if any(re.search(pattern, line, flags=re.I) for pattern in degree_patterns):
                clean_line = line.strip()
                if clean_line:
                    education_lines.append(clean_line)

        # If nothing found, try to capture common university mention patterns
        if not education_lines:
            uni_match = re.search(r"(university|college|institute)\s+of\s+[A-Za-z0-9 ]+", text, flags=re.I)
            if uni_match:
                education_lines.append(uni_match.group(0).strip())

        return education_lines

    def detect_missing_technologies(self, extracted_skills: Set[str], target_domain: str) -> List[str]:
        """Compare extracted skills against domain requirements to find missing gaps."""
        if target_domain not in self.domain_skills:
            return []

        required_skills = self.domain_skills[target_domain]
        missing_skills = required_skills - extracted_skills
        return sorted(list(missing_skills))

    def predict_domain_from_skills(self, extracted_skills: Set[str]) -> str:
        """Determines the best matching domains based on extracted skills."""
        if not extracted_skills:
            return "Software Engineering & Data Analysis" # Dynamic fallback for unparsed resumes
            
        domain_matches = []
        
        for domain, skills in self.domain_skills.items():
            overlap = len(extracted_skills.intersection(skills))
            if overlap > 0:
                domain_matches.append((domain, overlap))
                
        # If no explicit overlap was found, return a multi-domain generalist fallback
        if not domain_matches:
            return "Software Engineering & General IT"
            
        # Sort domains by overlap count descending
        domain_matches.sort(key=lambda x: x[1], reverse=True)
        
        # Take the top 2 matching domains (if the second one has at least some overlap)
        top_domains = [match[0] for match in domain_matches[:2]]
        
        return " & ".join(top_domains)

    def analyze(self, resume_text: str, target_domain: str) -> Dict:
        """Full analysis pipeline."""
        extracted = self.extract_skills(resume_text)
        missing = self.detect_missing_technologies(extracted, target_domain)

        total_required = len(self.domain_skills.get(target_domain, set()))
        match_score = (
            len(extracted.intersection(self.domain_skills.get(target_domain, set()))) / total_required
            if total_required > 0
            else 0.0
        )

        return {
            "target_domain": target_domain,
            "detected_skills": sorted(list(extracted)),
            "missing_technologies": missing,
            "match_percentage": round(match_score * 100, 2),
            "contact": self.extract_contact_info(resume_text),
            "experience_years": self.extract_experience_years(resume_text),
            "education": self.extract_education(resume_text),
        }


if __name__ == "__main__":
    analyzer = ResumeAnalyzer()

    # Test Data
    sample_resume = (
        "I am a software engineer with 2 years of experience. "
        "I have strong knowledge of Python, Pandas, and SQL. "
        "I have built several models using Machine Learning. Contact: john@example.com. "
        "LinkedIn: https://linkedin.com/in/johndoe"
    )
    target = "Data Science"

    print(f"Analyzing Resume for {target}...")
    print("-" * 40)
    print(f"Resume snippet: {sample_resume}\n")

    result = analyzer.analyze(sample_resume, target)
    print(f"Detected Skills: {result['detected_skills']}")
    print(f"Missing Technologies: {result['missing_technologies']}")
    print(f"Profile Match Score: {result['match_percentage']}%")
    print(f"Contact: {result['contact']}")
    print(f"Experience (years): {result['experience_years']}")
    print(f"Education: {result['education']}")
