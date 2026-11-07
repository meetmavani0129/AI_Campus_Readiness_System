import re
import io
import fitz

def _extract_text_from_pdf(pdf_stream) -> str:
    """Read all text from a PDF file stream using PyMuPDF."""
    try:
        # pdf_stream is an io.BytesIO object
        pdf_bytes = pdf_stream.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text with PyMuPDF: {e}")
        return ""

def _parse_cgpa(text: str) -> float:
    """Find CGPA or GPA ranging from 0.0 to 10.0"""
    # Look for "CGPA", "GPA", followed by optional whitespace/colon and a number
    # Examples: "CGPA: 8.5", "GPA 3.8", "8.5 CGPA"
    pattern = r'(?i)(?:cgpa|gpa)[\s:]*([0-9]{1,2}\.[0-9]{1,2})|([0-9]{1,2}\.[0-9]{1,2})[\s]*(?:cgpa|gpa)'
    matches = re.findall(pattern, text)
    
    best_cgpa = 0.0
    for m in matches:
        val_str = m[0] if m[0] else m[1]
        try:
            val = float(val_str)
            # Normalize to 10-point scale if it looks like a 4-point scale 
            # (A very rough estimate just to have viable data)
            if val <= 4.0 and val > 0:
                val = (val / 4.0) * 10.0
            
            if 0 < val <= 10.0:
                best_cgpa = max(best_cgpa, val)
        except ValueError:
            continue
            
    return best_cgpa if best_cgpa > 0 else 7.0 # Default fallback

def _count_keyword_occurrences(text: str, keywords: list) -> int:
    text_lower = text.lower()
    count = 0
    for kw in keywords:
        # Use simple substring count
        count += text_lower.count(kw.lower())
    return count

def _estimate_projects_internships(text: str):
    """Estimate number of projects and internships based on keyword density/bullet points."""
    text_lower = text.lower()
    
    projects = 0
    internships = 0
    
    # Very rudimentary counting: count occurrences of words like 'project', 'developed', 'built', 'intern', 'internship'
    project_kws = ['github.com', 'developed', 'built a', 'created a', 'personal project', 'academic project']
    intern_kws = ['intern', 'internship', 'summer trainee', 'industrial training']
    
    for kw in project_kws:
        projects += text_lower.count(kw)
    
    for kw in intern_kws:
        internships += text_lower.count(kw)
        
    # Cap the results to reasonable limits
    return min(10, projects), min(5, internships)

def parse_pdf_resume(pdf_stream):
    """
    Core entrypoint to parse a PDF file-like object into ML features.
    """
    text = _extract_text_from_pdf(pdf_stream)
    if not text.strip():
        return None
        
    # 1. Parse CGPA
    cgpa = _parse_cgpa(text)
    
    # 2. Extract Skills (Using existing analyzer logic)
    # 2. Extract Skills (Using existing analyzer logic)
    import sys
    import os
    
    # Ensure backend root is in sys.path
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_dir not in sys.path:
        sys.path.append(backend_dir)
        
    try:
        from features.resume_analyzer import ResumeAnalyzer
    except ModuleNotFoundError:
        # Fallback for some environments
        from resume_analyzer import ResumeAnalyzer
    
    analyzer = ResumeAnalyzer()
    extracted_skills_set = analyzer.extract_skills(text)
    skills_list = list(extracted_skills_set)
    
    # Estimate Domain from Skills
    target_domain = analyzer.predict_domain_from_skills(extracted_skills_set)
    
    # 3. Estimate Scores based on extracted skill categories
    # Rough heuristics:
    # Programming: heavily weighted by languages (python, java, c++)
    # Technical: weighted by tools/frameworks (sql, docker, aws)
    # Communication: hard to parse from tech resume, fallback to 70
    
    prog_kws = ['python', 'java', 'c++', 'javascript', 'typescript', 'c#', 'ruby', 'go']
    tech_kws = ['sql', 'aws', 'docker', 'kubernetes', 'react', 'node.js', 'django', 'machine learning', 'data']
    
    prog_count = sum(1 for s in skills_list if s.lower() in prog_kws)
    tech_count = sum(1 for s in skills_list if s.lower() in tech_kws)
    
    # Base 50, +10 for each skill found, max 100
    programming_score = min(100, 50 + (prog_count * 10))
    technical_score = min(100, 50 + (tech_count * 8))
    communication_score = 75 # Standard default assumption
    
    # 4. Count Projects / Internships
    projects, internships = _estimate_projects_internships(text)
    
    # Data Validation & Completeness check
    is_valid = True
    if cgpa < 4.0 or len(skills_list) < 2:
        is_valid = False
        
    return {
        "cgpa": round(cgpa, 2),
        "programming": programming_score,
        "technical": technical_score,
        "communication": communication_score,
        "projects": projects,
        "internships": internships,
        "skills": ", ".join(skills_list),
        "extracted_domain": target_domain,
        "is_valid": is_valid,
        "extracted_text_preview": text[:500] # for debugging
    }
