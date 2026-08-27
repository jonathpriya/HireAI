import re
from app.services.resume_parser import extract_text_from_file, COMMON_SKILLS

def parse_jd_content(file_path_or_text: str, is_file: bool = False):
    raw_text = extract_text_from_file(file_path_or_text) if is_file else file_path_or_text
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    text_lower = raw_text.lower()
    
    # 1. Job Title Extraction
    title = "Software Engineer"
    # Try finding title from first few non-empty lines
    for line in lines[:5]:
        if len(line) < 80 and not line.lower().startswith(("job description", "about us", "overview", "company", "role overview")):
            # Clean header decoration
            clean_title = re.sub(r'^[#*:\-\s]+', '', line).strip()
            if clean_title:
                title = clean_title
                break

    # 2. Skill Extraction
    found_skills = []
    for skill in COMMON_SKILLS:
        pattern = r'(?i)\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            display_skill = skill.title() if len(skill) > 3 else skill.upper()
            if display_skill not in found_skills:
                found_skills.append(display_skill)

    req_skills = found_skills[:6] if found_skills else ["Python", "JavaScript", "SQL"]
    pref_skills = found_skills[6:] if len(found_skills) > 6 else []

    # 3. Experience Required
    exp_required = 2.0
    exp_matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\b', text_lower)
    if exp_matches:
        try:
            exp_required = float(exp_matches[0])
        except ValueError:
            exp_required = 2.0

    # 4. Qualification Extraction
    qualification = "Bachelor's Degree in Computer Science or related field"
    if "master" in text_lower or "m.tech" in text_lower or "ms " in text_lower:
        qualification = "Master's Degree in Computer Science / IT"
    elif "phd" in text_lower or "doctorate" in text_lower:
        qualification = "Ph.D. in Computer Science, AI, or Data Science"

    # 5. Salary Extraction
    salary = "$90,000 - $130,000 / year"
    salary_match = re.search(r'(\$?\d{2,3}(?:,\d{3})*(?:\s*-\s*\$?\d{2,3}(?:,\d{3})*)?\s*(?:lpa|k|\/year|per year|usd)?)', text_lower)
    if salary_match:
        salary = salary_match.group(1).strip()

    # 6. Location Extraction
    location = "Remote / Hybrid"
    if "remote" in text_lower:
        location = "Remote"
    elif "hybrid" in text_lower:
        location = "Hybrid"
    elif "bangalore" in text_lower or "bengaluru" in text_lower:
        location = "Bangalore, India"
    elif "new york" in text_lower or "ny" in text_lower:
        location = "New York, USA"
    elif "san francisco" in text_lower or "sf" in text_lower:
        location = "San Francisco, CA"

    return {
        "title": title,
        "description": raw_text[:2000],
        "extracted_skills": found_skills,
        "required_skills": ", ".join(req_skills),
        "preferred_skills": ", ".join(pref_skills),
        "experience_required": exp_required,
        "qualification": qualification,
        "salary": salary,
        "location": location,
        "raw_text": raw_text
    }
