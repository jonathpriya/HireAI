"""
seed_data.py — Populate the database with demo data.

Creates:
  - 15 candidate users (with profiles + resume text)
  - 5 recruiter users (with profiles)
  - 5 job postings (one per recruiter)
  - Runs AI matching for all jobs

Run from the backend directory:
    python -m app.seed_data

Login credentials:
  Candidates : candidate01@gmail.com … candidate15@gmail.com  | password: Candidate@123
  Recruiters : hr@techcorp.com, hr@datasolutions.com, hr@cloudworks.com,
               hr@aiventures.com, hr@devhub.com               | password: Recruiter@123
  Admin      : admin@mycompany.com                            | password: Admin@123
"""

import json
import sys
import os

# Ensure the project root is in sys.path when run as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, CandidateProfile, RecruiterProfile, Job, Resume
from app.security import get_password_hash

# ─── Seed constants ────────────────────────────────────────────────────────────

CANDIDATE_PASSWORD = get_password_hash("Candidate@123")
RECRUITER_PASSWORD = get_password_hash("Recruiter@123")
ADMIN_PASSWORD     = get_password_hash("Admin@123")

CANDIDATES = [
    {
        "full_name": "Aarav Sharma",
        "email": "candidate01@gmail.com",
        "mobile": "9000000001",
        "education": "B.Tech in Computer Science",
        "experience_years": 3.0,
        "skills": ["Python", "Django", "REST API", "PostgreSQL", "Docker"],
        "current_company": "Infosys",
        "expected_salary": "8 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Aarav Sharma – Software Engineer with 3 years of experience in Python and Django. "
            "Worked at Infosys on REST API development and PostgreSQL databases. "
            "Proficient in Docker and Linux environments."
        ),
    },
    {
        "full_name": "Priya Nair",
        "email": "candidate02@gmail.com",
        "mobile": "9000000002",
        "education": "M.Tech in Data Science",
        "experience_years": 4.5,
        "skills": ["Machine Learning", "Python", "TensorFlow", "Pandas", "SQL"],
        "current_company": "TCS",
        "expected_salary": "12 LPA",
        "preferred_location": "Hyderabad",
        "resume_text": (
            "Priya Nair – Data Scientist with 4.5 years of experience. "
            "Expert in Machine Learning, TensorFlow, Pandas, and SQL. "
            "Delivered ML models at TCS improving prediction accuracy by 30%."
        ),
    },
    {
        "full_name": "Rohan Gupta",
        "email": "candidate03@gmail.com",
        "mobile": "9000000003",
        "education": "B.E. in Electronics",
        "experience_years": 2.0,
        "skills": ["Java", "Spring Boot", "MySQL", "Microservices", "Git"],
        "current_company": "Wipro",
        "expected_salary": "7 LPA",
        "preferred_location": "Pune",
        "resume_text": (
            "Rohan Gupta – Java Developer with 2 years at Wipro. "
            "Built microservices using Spring Boot and MySQL. Familiar with Git workflows."
        ),
    },
    {
        "full_name": "Sneha Reddy",
        "email": "candidate04@gmail.com",
        "mobile": "9000000004",
        "education": "B.Tech in IT",
        "experience_years": 5.0,
        "skills": ["React", "JavaScript", "TypeScript", "Node.js", "CSS"],
        "current_company": "HCL Technologies",
        "expected_salary": "14 LPA",
        "preferred_location": "Chennai",
        "resume_text": (
            "Sneha Reddy – Full Stack Developer with 5 years of experience in React and Node.js. "
            "Leads frontend team at HCL Technologies building enterprise web apps."
        ),
    },
    {
        "full_name": "Arjun Patel",
        "email": "candidate05@gmail.com",
        "mobile": "9000000005",
        "education": "MBA + B.Tech",
        "experience_years": 7.0,
        "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Python"],
        "current_company": "Capgemini",
        "expected_salary": "20 LPA",
        "preferred_location": "Mumbai",
        "resume_text": (
            "Arjun Patel – Cloud Engineer with 7 years of experience. "
            "Specializes in AWS, Kubernetes, Terraform and CI/CD pipelines at Capgemini."
        ),
    },
    {
        "full_name": "Kavya Menon",
        "email": "candidate06@gmail.com",
        "mobile": "9000000006",
        "education": "M.Sc. in Statistics",
        "experience_years": 3.5,
        "skills": ["R", "Python", "Data Visualization", "Tableau", "SQL", "Statistics"],
        "current_company": "Mu Sigma",
        "expected_salary": "10 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Kavya Menon – Data Analyst with 3.5 years at Mu Sigma. "
            "Proficient in R, Python, Tableau and statistical modelling."
        ),
    },
    {
        "full_name": "Vikram Singh",
        "email": "candidate07@gmail.com",
        "mobile": "9000000007",
        "education": "B.Tech in Computer Science",
        "experience_years": 8.5,
        "skills": ["Java", "Scala", "Apache Spark", "Hadoop", "Kafka", "AWS"],
        "current_company": "IBM India",
        "expected_salary": "24 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Vikram Singh – Senior Data Engineer with 8.5 years at IBM India. "
            "Expert in Apache Spark, Hadoop, Kafka, and AWS big data pipelines."
        ),
    },
    {
        "full_name": "Divya Krishnan",
        "email": "candidate08@gmail.com",
        "mobile": "9000000008",
        "education": "B.Tech in CSE",
        "experience_years": 1.5,
        "skills": ["HTML", "CSS", "JavaScript", "React", "Figma"],
        "current_company": "Freshworks",
        "expected_salary": "5 LPA",
        "preferred_location": "Chennai",
        "resume_text": (
            "Divya Krishnan – Junior Frontend Developer with 1.5 years at Freshworks. "
            "Skilled in React, HTML/CSS and UI prototyping with Figma."
        ),
    },
    {
        "full_name": "Nikhil Joshi",
        "email": "candidate09@gmail.com",
        "mobile": "9000000009",
        "education": "B.Tech in CSE",
        "experience_years": 11.0,
        "skills": ["Python", "Django", "AWS", "System Design", "Team Leadership", "PostgreSQL"],
        "current_company": "Adobe",
        "expected_salary": "35 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Nikhil Joshi – Principal Engineer with 11 years at Adobe. "
            "Expert in Python/Django, AWS, system design and technical leadership."
        ),
    },
    {
        "full_name": "Lakshmi Iyer",
        "email": "candidate10@gmail.com",
        "mobile": "9000000010",
        "education": "M.Tech in AI",
        "experience_years": 6.0,
        "skills": ["Deep Learning", "PyTorch", "Computer Vision", "NLP", "Python", "FastAPI"],
        "current_company": "Samsung R&D",
        "expected_salary": "22 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Lakshmi Iyer – AI/ML Engineer with 6 years at Samsung R&D. "
            "Expert in Deep Learning, Computer Vision and NLP using PyTorch and FastAPI."
        ),
    },
    {
        "full_name": "Rahul Verma",
        "email": "candidate11@gmail.com",
        "mobile": "9000000011",
        "education": "B.Tech in IT",
        "experience_years": 4.0,
        "skills": ["DevOps", "Jenkins", "Docker", "Kubernetes", "Linux", "Shell Scripting"],
        "current_company": "Mindtree",
        "expected_salary": "13 LPA",
        "preferred_location": "Pune",
        "resume_text": (
            "Rahul Verma – DevOps Engineer with 4 years at Mindtree. "
            "Skilled in Jenkins CI/CD, Docker, Kubernetes and Linux administration."
        ),
    },
    {
        "full_name": "Ananya Das",
        "email": "candidate12@gmail.com",
        "mobile": "9000000012",
        "education": "B.Sc. in Computer Science",
        "experience_years": 2.5,
        "skills": ["iOS", "Swift", "Xcode", "REST API", "Git"],
        "current_company": "Zoho Corporation",
        "expected_salary": "9 LPA",
        "preferred_location": "Chennai",
        "resume_text": (
            "Ananya Das – iOS Developer with 2.5 years at Zoho. "
            "Builds Swift-based iOS apps with REST API integration."
        ),
    },
    {
        "full_name": "Siddharth Rao",
        "email": "candidate13@gmail.com",
        "mobile": "9000000013",
        "education": "B.Tech in CSE",
        "experience_years": 9.0,
        "skills": ["SAP", "ABAP", "S/4HANA", "Fiori", "SQL", "FICO"],
        "current_company": "Accenture",
        "expected_salary": "30 LPA",
        "preferred_location": "Hyderabad",
        "resume_text": (
            "Siddharth Rao – SAP Consultant with 9 years at Accenture. "
            "Expert in SAP ABAP, S/4HANA, Fiori and FICO module implementations."
        ),
    },
    {
        "full_name": "Meera Pillai",
        "email": "candidate14@gmail.com",
        "mobile": "9000000014",
        "education": "M.Tech in Software Engineering",
        "experience_years": 5.5,
        "skills": ["Angular", "TypeScript", "Node.js", "MongoDB", "GraphQL", "AWS"],
        "current_company": "Mphasis",
        "expected_salary": "16 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Meera Pillai – Full Stack Developer with 5.5 years at Mphasis. "
            "Expert in Angular, Node.js, MongoDB and GraphQL deployed on AWS."
        ),
    },
    {
        "full_name": "Karthik Subramanian",
        "email": "candidate15@gmail.com",
        "mobile": "9000000015",
        "education": "B.Tech in CSE",
        "experience_years": 12.0,
        "skills": ["Solution Architecture", "AWS", "Microservices", "Java", "System Design", "Cloud"],
        "current_company": "Oracle India",
        "expected_salary": "42 LPA",
        "preferred_location": "Bangalore",
        "resume_text": (
            "Karthik Subramanian – Solutions Architect with 12 years at Oracle India. "
            "Designs large-scale microservices architectures on AWS with Java."
        ),
    },
]

RECRUITERS = [
    {
        "full_name": "Preethi Sharma",
        "email": "hr@techcorp.com",
        "mobile": "9100000001",
        "company_name": "TechCorp",
        "website": "https://techcorp.com",
        "description": "Leading product engineering company building next-gen software.",
    },
    {
        "full_name": "Ajay Mathew",
        "email": "hr@datasolutions.com",
        "mobile": "9100000002",
        "company_name": "DataSolutions",
        "website": "https://datasolutions.com",
        "description": "Data-driven consulting firm specializing in analytics and BI.",
    },
    {
        "full_name": "Nisha Bansal",
        "email": "hr@cloudworks.com",
        "mobile": "9100000003",
        "company_name": "CloudWorks",
        "website": "https://cloudworks.com",
        "description": "Cloud infrastructure and DevOps services provider.",
    },
    {
        "full_name": "Ramesh Kumar",
        "email": "hr@aiventures.com",
        "mobile": "9100000004",
        "company_name": "AIVentures",
        "website": "https://aiventures.com",
        "description": "AI-first startup solving complex enterprise problems.",
    },
    {
        "full_name": "Sunita Rajan",
        "email": "hr@devhub.com",
        "mobile": "9100000005",
        "company_name": "DevHub",
        "website": "https://devhub.com",
        "description": "Platform for collaborative software development and DevOps.",
    },
]

JOBS = [
    {
        "recruiter_email": "hr@techcorp.com",
        "title": "Python Backend Developer",
        "description": (
            "We are looking for a mid-level Python developer to build and maintain REST APIs "
            "for our SaaS platform using Django, PostgreSQL and Docker."
        ),
        "required_skills": ["Python", "Django", "REST API", "PostgreSQL", "Docker"],
        "experience_required": 3.0,
        "qualification": "B.Tech / B.E. in CSE or related",
        "salary": "8-12 LPA",
        "employment_type": "Full-Time",
        "location": "Bangalore",
    },
    {
        "recruiter_email": "hr@datasolutions.com",
        "title": "Data Scientist – ML",
        "description": (
            "Join our analytics team to build predictive models and data pipelines. "
            "Must be experienced in Python, Machine Learning, TensorFlow and SQL."
        ),
        "required_skills": ["Machine Learning", "Python", "TensorFlow", "Pandas", "SQL"],
        "experience_required": 4.0,
        "qualification": "M.Tech / M.Sc. in CS, Statistics or Data Science",
        "salary": "10-16 LPA",
        "employment_type": "Full-Time",
        "location": "Hyderabad",
    },
    {
        "recruiter_email": "hr@cloudworks.com",
        "title": "Cloud & DevOps Engineer",
        "description": (
            "Looking for a DevOps Engineer with strong skills in AWS, Kubernetes, Docker and Terraform "
            "to manage our cloud infrastructure and CI/CD pipelines."
        ),
        "required_skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
        "experience_required": 6.0,
        "qualification": "B.Tech in CSE / IT",
        "salary": "18-25 LPA",
        "employment_type": "Full-Time",
        "location": "Mumbai",
    },
    {
        "recruiter_email": "hr@aiventures.com",
        "title": "Senior AI/ML Engineer",
        "description": (
            "We need a senior AI engineer to lead our deep learning and NLP initiatives. "
            "Experience with PyTorch, Computer Vision and FastAPI required."
        ),
        "required_skills": ["Deep Learning", "PyTorch", "Computer Vision", "NLP", "Python", "FastAPI"],
        "experience_required": 5.0,
        "qualification": "M.Tech in AI/ML or equivalent",
        "salary": "20-28 LPA",
        "employment_type": "Full-Time",
        "location": "Bangalore",
    },
    {
        "recruiter_email": "hr@devhub.com",
        "title": "Full Stack Developer – React & Node",
        "description": (
            "Seeking a talented full stack developer with expertise in React, TypeScript, "
            "Node.js and MongoDB to build scalable web applications."
        ),
        "required_skills": ["React", "TypeScript", "Node.js", "MongoDB", "JavaScript"],
        "experience_required": 4.0,
        "qualification": "B.Tech in CSE or equivalent",
        "salary": "12-18 LPA",
        "employment_type": "Full-Time",
        "location": "Bangalore",
    },
]


# ─── Seeding Logic ─────────────────────────────────────────────────────────────

def seed(db: Session):
    # ── Admin User ────────────────────────────────────────────────
    admin_email = os.getenv("ADMIN_EMAIL", "admin@mycompany.com")
    if not db.query(User).filter(User.email == admin_email).first():
        admin = User(
            email=admin_email,
            password_hash=ADMIN_PASSWORD,
            role="admin",
            full_name="Platform Admin",
            mobile="9999999999"
        )
        db.add(admin)
        db.commit()
        print(f"  [OK] Admin created: {admin_email} / Admin@123")

    # ── Recruiters ────────────────────────────────────────────────
    # ── Recruiters ────────────────────────────────────────────────
    import uuid
    from app.models import CreditTransaction

    recruiter_map: dict[str, int] = {}
    for rec_data in RECRUITERS:
        existing = db.query(User).filter(User.email == rec_data["email"]).first()
        if existing:
            recruiter_map[rec_data["email"]] = existing.id
            # Ensure credits & referral code populated for existing
            if not existing.credits:
                existing.credits = 30
            if not existing.referral_code:
                existing.referral_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
            db.commit()
            continue

        ref_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
        user = User(
            email=rec_data["email"],
            password_hash=RECRUITER_PASSWORD,
            role="recruiter",
            full_name=rec_data["full_name"],
            mobile=rec_data["mobile"],
            credits=30,
            referral_code=ref_code
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        db.add(CreditTransaction(
            user_id=user.id,
            amount=30,
            balance_after=30,
            reason="registration_bonus"
        ))

        profile = RecruiterProfile(
            user_id=user.id,
            company_name=rec_data["company_name"],
            recruiter_name=rec_data["full_name"],
            website=rec_data["website"],
            description=rec_data["description"]
        )
        db.add(profile)
        db.commit()
        recruiter_map[rec_data["email"]] = user.id
        print(f"  [OK] Recruiter created: {rec_data['email']}")

    # ── Candidates ────────────────────────────────────────────────
    for cand_data in CANDIDATES:
        existing = db.query(User).filter(User.email == cand_data["email"]).first()
        if existing:
            if not existing.credits:
                existing.credits = 10
            if not existing.referral_code:
                existing.referral_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
            db.commit()
            continue

        ref_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
        user = User(
            email=cand_data["email"],
            password_hash=CANDIDATE_PASSWORD,
            role="candidate",
            full_name=cand_data["full_name"],
            mobile=cand_data["mobile"],
            credits=10,
            referral_code=ref_code
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        db.add(CreditTransaction(
            user_id=user.id,
            amount=10,
            balance_after=10,
            reason="registration_bonus"
        ))


        import random
        comm_score = round(random.uniform(78.0, 95.0), 1)

        profile = CandidateProfile(
            user_id=user.id,
            education=cand_data["education"],
            experience_years=cand_data["experience_years"],
            skills_json=json.dumps(cand_data["skills"]),
            current_company=cand_data["current_company"],
            expected_salary=cand_data["expected_salary"],
            preferred_location=cand_data["preferred_location"],
            communication_score=comm_score,
            completion_pct=100
        )
        db.add(profile)


        resume = Resume(
            candidate_id=user.id,
            file_path=f"/uploads/resumes/seed_{user.id}.txt",
            file_name=f"{cand_data['full_name'].replace(' ', '_')}_Resume.txt",
            raw_text=cand_data["resume_text"],
            extracted_skills_json=json.dumps(cand_data["skills"]),
            extracted_experience_years=cand_data["experience_years"]
        )
        db.add(resume)
        db.commit()
        print(f"  [OK] Candidate created: {cand_data['email']}")

    # ── Jobs + AI Matching ────────────────────────────────────────
    from app.routers.recruiter import run_ai_matching_for_job

    for job_data in JOBS:
        recruiter_id = recruiter_map.get(job_data["recruiter_email"])
        if not recruiter_id:
            continue

        existing_job = db.query(Job).filter(
            Job.recruiter_id == recruiter_id,
            Job.title == job_data["title"]
        ).first()
        if existing_job:
            print(f"  [SKIP] Job already exists: {job_data['title']}")
            continue

        job = Job(
            recruiter_id=recruiter_id,
            title=job_data["title"],
            description=job_data["description"],
            required_skills_json=json.dumps(job_data["required_skills"]),
            preferred_skills_json=json.dumps([]),
            experience_required=job_data["experience_required"],
            qualification=job_data["qualification"],
            salary=job_data["salary"],
            employment_type=job_data["employment_type"],
            location=job_data["location"],
            status="active"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        # Run AI matching — this also sends invitations ≥75%
        run_ai_matching_for_job(db, job)
        print(f"  [OK] Job created & matched: {job_data['title']}")


def main():
    print("\n[START] Starting database seeding...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        seed(db)
        print("\n[DONE] Seeding complete!\n")
        print("-" * 50)
        print("LOGIN CREDENTIALS")
        print("-" * 50)
        print("ADMIN:")
        print(f"  Email    : admin@mycompany.com")
        print(f"  Password : Admin@123")
        print("\nRECRUITERS (password: Recruiter@123):")
        for r in RECRUITERS:
            print(f"  {r['email']}  ({r['company_name']})")
        print("\nCANDIDATES (password: Candidate@123):")
        for i, c in enumerate(CANDIDATES, 1):
            print(f"  {c['email']}  -- {c['full_name']}  ({c['experience_years']} yrs)")
        print("-" * 50)
    finally:
        db.close()


if __name__ == "__main__":
    main()
