import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job, RecruiterProfile
from app.schemas import JobOut

router = APIRouter(prefix="/api/jobs", tags=["Public Jobs Catalog"])

@router.get("", response_model=List[JobOut])
def get_public_active_jobs(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.status == "active")

    if search:
        query = query.filter(
            (Job.title.ilike(f"%{search}%")) | 
            (Job.description.ilike(f"%{search}%")) |
            (Job.required_skills_json.ilike(f"%{search}%"))
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    jobs_data = query.order_by(Job.created_at.desc()).all()

    res = []
    for j, rec_profile in jobs_data:
        res.append(JobOut(
            id=j.id,
            recruiter_id=j.recruiter_id,
            title=j.title,
            description=j.description,
            required_skills=json.loads(j.required_skills_json) if j.required_skills_json else [],
            preferred_skills=json.loads(j.preferred_skills_json) if j.preferred_skills_json else [],
            experience_required=j.experience_required,
            qualification=j.qualification,
            salary=j.salary,
            employment_type=j.employment_type,
            location=j.location,
            status=j.status,
            jd_file_path=j.jd_file_path,
            created_at=j.created_at,
            company_name=rec_profile.company_name if rec_profile else "Company"
        ))
    return res

@router.get("/{job_id}", response_model=JobOut)
def get_public_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job_tuple = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.id == job_id).first()

    if not job_tuple:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")

    j, rec_profile = job_tuple
    return JobOut(
        id=j.id,
        recruiter_id=j.recruiter_id,
        title=j.title,
        description=j.description,
        required_skills=json.loads(j.required_skills_json) if j.required_skills_json else [],
        preferred_skills=json.loads(j.preferred_skills_json) if j.preferred_skills_json else [],
        experience_required=j.experience_required,
        qualification=j.qualification,
        salary=j.salary,
        employment_type=j.employment_type,
        location=j.location,
        status=j.status,
        jd_file_path=j.jd_file_path,
        created_at=j.created_at,
        company_name=rec_profile.company_name if rec_profile else "Company"
    )


# ─── Candidate AI Match & Skill Gap Analysis Endpoints ────────────────

@router.get("/{job_id}/ai-match-gap")
def get_job_ai_match_gap(
    job_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(lambda: None)  # Optional Auth Token via header
):
    from fastapi import Request
    from app.security import get_current_user
    from app.models import CandidateProfile, Resume, CandidateInvitation, RecruiterProfile, MatchResult
    from app.services.ai_matcher import calculate_candidate_match

    job_tuple = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.id == job_id).first()

    if not job_tuple:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")

    j, rec_profile = job_tuple

    # Return base job info if not logged in
    return {
        "job_id": j.id,
        "title": j.title,
        "company_name": rec_profile.company_name if rec_profile else "Company",
        "required_skills": json.loads(j.required_skills_json) if j.required_skills_json else [],
        "preferred_skills": json.loads(j.preferred_skills_json) if j.preferred_skills_json else [],
        "experience_required": j.experience_required,
    }

@router.get("/feed.xml")
def get_jobs_xml_feed(db: Session = Depends(get_db)):
    """
    Standard XML / RSS Feed for Indeed, ZipRecruiter, Google for Jobs, and Free Job Aggregators.
    """
    from fastapi.responses import Response
    jobs = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.status == "active").all()

    xml_items = []
    for j, rec in jobs:
        company = rec.company_name if rec else "HireAI Partner"
        skills = json.loads(j.required_skills_json) if j.required_skills_json else []
        skills_str = ", ".join(skills)
        xml_items.append(f"""
        <job>
            <title><![CDATA[{j.title}]]></title>
            <company><![CDATA[{company}]]></company>
            <location><![CDATA[{j.location}]]></location>
            <description><![CDATA[{j.description}]]></description>
            <skills><![CDATA[{skills_str}]]></skills>
            <experience><![CDATA[{j.experience_required} Years]]></experience>
            <url><![CDATA[http://localhost:5173/career?job_id={j.id}]]></url>
            <pubdate>{j.created_at.strftime('%Y-%m-%dT%H:%M:%SZ') if j.created_at else ''}</pubdate>
        </job>
        """)

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
    <source>
        <publisher>HireAI ATS Platform</publisher>
        <publisherurl>http://localhost:5173</publisherurl>
        <lastBuildDate>{jobs[0][0].created_at.strftime('%Y-%m-%dT%H:%M:%SZ') if jobs and jobs[0][0].created_at else ''}</lastBuildDate>
        {''.join(xml_items)}
    </source>"""

    return Response(content=xml_content, media_type="application/xml")


@router.get("/feed.json")
def get_jobs_json_feed(db: Session = Depends(get_db)):
    """
    Standard JSON Feed with Schema.org JobPosting format for Google for Jobs and API consumers.
    """
    jobs = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.status == "active").all()

    feed_items = []
    for j, rec in jobs:
        company = rec.company_name if rec else "HireAI Partner"
        feed_items.append({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": j.title,
            "description": j.description,
            "identifier": {"@type": "PropertyValue", "name": company, "value": f"JOB-{j.id}"},
            "datePosted": j.created_at.isoformat() if j.created_at else "",
            "employmentType": j.employment_type or "FULL_TIME",
            "hiringOrganization": {"@type": "Organization", "name": company},
            "jobLocation": {"@type": "Place", "address": {"@type": "PostalAddress", "addressLocality": j.location}},
            "skills": json.loads(j.required_skills_json) if j.required_skills_json else [],
            "directApply": True,
            "url": f"http://localhost:5173/career?job_id={j.id}"
        })

    return {"count": len(feed_items), "jobs": feed_items}


