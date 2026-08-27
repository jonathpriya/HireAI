import re
from pathlib import Path
import pypdf
import docx

COMMON_SKILLS = [
    "python", "react", "react.js", "javascript", "typescript", "fastapi", "django", "flask",
    "node", "node.js", "express", "sql", "postgresql", "mysql", "sqlite", "mongodb", "redis",
    "html", "css", "tailwind", "tailwindcss", "bootstrap", "git", "github", "docker", "kubernetes",
    "aws", "azure", "gcp", "machine learning", "deep learning", "nlp", "scikit-learn", "sklearn",
    "tensorflow", "pytorch", "pandas", "numpy", "opencv", "spacy", "nltk", "rest api", "graphql",
    "java", "c++", "c#", "php", "ruby", "swift", "kotlin", "flutter", "devops", "ci/cd",
    "agile", "scrum", "jira", "unit testing", "pytest", "jest", "alembic", "sqlalchemy",
    "linux", "bash", "shell scripting", "terraform", "ansible", "jenkins", "gitlab", "bitbucket",
    "spring boot", "hibernate", "maven", "gradle", "microservices", "kafka", "rabbitmq",
    "elasticsearch", "neo4j", "firebase", "supabase", "next.js", "vue", "angular", "svelte",
    "r", "tableau", "power bi", "spark", "hadoop", "airflow", "dbt", "looker", "bigquery",
    "sap", "abap", "salesforce", "oracle", "sas", "matlab", "scala", "go", "rust",
    "selenium", "cypress", "playwright", "postman", "swagger", "openapi", "figma", "xd",
    "ios", "android", "react native", "xamarin", "unity", "unreal", "opengl",
    "pytorch lightning", "huggingface", "langchain", "openai", "llm", "computer vision",
    "data analysis", "data science", "data engineering", "etl", "data visualization",
    "statistics", "regression", "classification", "clustering", "neural networks",
    "system design", "team leadership", "project management", "communication"
]

EDUCATION_KEYWORDS = [
    "b.tech", "b.e", "b.sc", "b.com", "bca", "bba", "b.arch", "ba",
    "m.tech", "m.e", "m.sc", "mca", "mba", "m.arch", "ma", "ms",
    "phd", "ph.d", "doctorate",
    "bachelor", "master", "degree", "diploma", "10th", "12th",
    "computer science", "information technology", "electronics", "electrical",
    "mechanical", "civil", "data science", "artificial intelligence", "statistics",
    "mathematics", "physics", "commerce", "arts", "business administration",
    "software engineering", "machine learning"
]

LOCATION_KEYWORDS = [
    "bangalore", "bengaluru", "hyderabad", "chennai", "mumbai", "pune",
    "delhi", "new delhi", "noida", "gurgaon", "gurugram", "kolkata",
    "ahmedabad", "surat", "jaipur", "kochi", "thiruvananthapuram",
    "coimbatore", "indore", "bhopal", "nagpur", "chandigarh",
    "remote", "work from home", "wfh", "hybrid"
]


# ─── File Text Extraction ──────────────────────────────────────────────────────

def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    text = ""
    try:
        if ext == ".pdf":
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif ext in [".docx", ".doc"]:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text:
                    text += paragraph.text + "\n"
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        print(f"Error parsing resume file {file_path}: {e}")
    return text


# ─── Field Extractors ──────────────────────────────────────────────────────────

def _extract_skills(text_lower: str) -> list:
    found = set()
    for skill in COMMON_SKILLS:
        pattern = r'(?i)\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill.title() if len(skill) > 3 else skill.upper())
    return sorted(list(found))


def _extract_experience(text_lower: str) -> float:
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\b', text_lower)
    if matches:
        try:
            return max([float(m) for m in matches])
        except ValueError:
            pass
    return 0.0


def _extract_education(text: str) -> str:
    """Extract the highest/most relevant education qualification from the resume."""
    lines = text.split('\n')
    text_lower = text.lower()

    # Priority: doctorate > masters > bachelors > diploma
    priority_map = {
        "phd": 5, "ph.d": 5, "doctorate": 5,
        "m.tech": 4, "m.e": 4, "m.sc": 4, "mca": 4, "mba": 4, "ms": 4, "master": 4,
        "b.tech": 3, "b.e": 3, "b.sc": 3, "bca": 3, "bba": 3, "bachelor": 3,
        "diploma": 2, "12th": 1, "10th": 0,
    }

    best_line = ""
    best_score = -1

    for line in lines:
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 5:
            continue
        line_lower = line_clean.lower()

        # Check if line has an education keyword
        has_edu = any(kw in line_lower for kw in EDUCATION_KEYWORDS)
        if not has_edu:
            continue

        # Score by degree priority
        score = 0
        for deg, pri in priority_map.items():
            if deg in line_lower:
                score = max(score, pri)

        if score > best_score:
            best_score = score
            best_line = line_clean

    # Truncate long education lines
    if best_line and len(best_line) > 80:
        best_line = best_line[:80]

    return best_line if best_score >= 0 else ""


def _extract_current_company(text: str) -> str:
    """Try to extract the most recent/current employer from the resume."""
    lines = text.split('\n')

    # Heuristic: look for lines near "experience", "work", "employment" section
    # with company-like patterns (capitalized words, "at", "ltd", "pvt", "inc", "solutions" etc.)
    company_indicators = [
        "ltd", "pvt", "inc", "llc", "corp", "corporation", "technologies", "tech",
        "solutions", "systems", "services", "consulting", "infotech", "software",
        "infosys", "tcs", "wipro", "hcl", "ibm", "accenture", "capgemini",
        "cognizant", "mindtree", "mphasis", "zoho", "freshworks", "adobe",
        "oracle", "samsung", "google", "microsoft", "amazon", "flipkart"
    ]

    current_markers = [
        "present", "current", "currently", "till date", "to date", "ongoing"
    ]

    # First pass: find lines that mention "present" (i.e., current job)
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if any(m in line_lower for m in current_markers):
            # Look at surrounding lines (±3) for company name
            for offset in range(-3, 4):
                idx = i + offset
                if 0 <= idx < len(lines):
                    candidate = lines[idx].strip()
                    cand_lower = candidate.lower()
                    if any(ind in cand_lower for ind in company_indicators):
                        # Clean up the line — remove dates, bullets, dashes
                        cleaned = re.sub(r'[\-–|•*]', '', candidate).strip()
                        cleaned = re.sub(r'\d{4}.*', '', cleaned).strip()
                        if 3 < len(cleaned) < 60:
                            return cleaned

    # Second pass: find any line with a company indicator
    for line in lines:
        line_clean = line.strip()
        line_lower = line_clean.lower()
        if any(ind in line_lower for ind in company_indicators):
            cleaned = re.sub(r'[\-–|•*]', '', line_clean).strip()
            cleaned = re.sub(r'\d{4}.*', '', cleaned).strip()
            if 3 < len(cleaned) < 60:
                return cleaned

    return ""


def _extract_location(text_lower: str) -> str:
    """Extract preferred/current location from resume."""
    for loc in LOCATION_KEYWORDS:
        if re.search(r'\b' + re.escape(loc) + r'\b', text_lower):
            return loc.title()
    return ""


def _extract_email(text: str) -> str:
    match = re.search(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else ""


def _extract_phone(text: str) -> str:
    match = re.search(r'(\+91[\s-]?)?[6-9]\d{9}', text)
    return match.group(0).strip() if match else ""


def _extract_linkedin(text: str) -> str:
    match = re.search(r'(https?://)?(www\.)?linkedin\.com/in/[\w\-]+', text, re.IGNORECASE)
    return match.group(0) if match else ""


def _extract_github(text: str) -> str:
    match = re.search(r'(https?://)?(www\.)?github\.com/[\w\-]+', text, re.IGNORECASE)
    return match.group(0) if match else ""


# ─── Main Parser ───────────────────────────────────────────────────────────────

def parse_resume_content(raw_text: str) -> dict:
    """
    Parse resume text and extract all profile-fillable fields:
    - skills, experience_years, education, current_company,
      preferred_location, linkedin_url, github_url, email, phone
    """
    text_lower = raw_text.lower()

    return {
        "skills": _extract_skills(text_lower),
        "experience_years": _extract_experience(text_lower),
        "education": _extract_education(raw_text),
        "current_company": _extract_current_company(raw_text),
        "preferred_location": _extract_location(text_lower),
        "linkedin_url": _extract_linkedin(raw_text),
        "github_url": _extract_github(raw_text),
        "email": _extract_email(raw_text),
        "phone": _extract_phone(raw_text),
        "raw_text": raw_text,
    }
