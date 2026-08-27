"""
Admin/Developer Router — full platform visibility.
Accessible only to users whose email ends with @<ADMIN_EMAIL_DOMAIN>.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import require_admin
from app.models import User, CandidateProfile, RecruiterProfile, Job, Resume, CandidateInvitation, MatchResult, Review
from app.schemas import ReviewCreate, ReviewOut
from sqlalchemy import func

router = APIRouter(prefix="/api/admin", tags=["Admin / Developer Portal"])


# ─────────────────────────────────────────────────────────────────────────────
#  Platform Statistics
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/stats")
def platform_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_candidates = db.query(User).filter(User.role == "candidate").count()
    total_recruiters = db.query(User).filter(User.role == "recruiter").count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    total_invites = db.query(CandidateInvitation).count()
    pending_invites = db.query(CandidateInvitation).filter(CandidateInvitation.status == "pending").count()
    interested = db.query(CandidateInvitation).filter(CandidateInvitation.status == "interested").count()
    rejected = db.query(CandidateInvitation).filter(CandidateInvitation.status == "rejected").count()
    total_resumes = db.query(Resume).count()
    total_matches = db.query(MatchResult).count()

    # Date‑wise registrations (last 30 days)
    from sqlalchemy import func
    reg_counts = (
        db.query(func.date(User.created_at).label("date"), func.count())
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at).desc())
        .limit(30)
        .all()
    )
    registrations_by_date = {str(date): count for date, count in reg_counts}

    # Credit and referral summary
    total_credits = db.query(func.coalesce(func.sum(User.credits), 0)).scalar() or 0
    total_referrals = db.query(func.count(User.referral_code)).scalar() or 0

    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_invitations": total_invites,
        "pending_invitations": pending_invites,
        "interested_invitations": interested,
        "rejected_invitations": rejected,
        "total_resumes": total_resumes,
        "total_match_results": total_matches,
        "registrations_by_date": registrations_by_date,
        "total_credits": total_credits,
        "total_referrals": total_referrals,
    }


# ─────────────────────────────────────────────────────────────────────────────
#  User Management
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users")
def list_all_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    users = q.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "mobile": u.mobile,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}


# ─────────────────────────────────────────────────────────────────────────────
#  Candidate Details
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/candidates")
def list_all_candidates(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    candidates = db.query(User, CandidateProfile).outerjoin(
        CandidateProfile, CandidateProfile.user_id == User.id
    ).filter(User.role == "candidate").order_by(User.created_at.desc()).all()

    result = []
    for user, profile in candidates:
        has_resume = db.query(Resume).filter(Resume.candidate_id == user.id).first() is not None
        total_invitations = db.query(CandidateInvitation).filter(
            CandidateInvitation.candidate_id == user.id
        ).count()
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "mobile": user.mobile,
            "education": profile.education if profile else None,
            "experience_years": profile.experience_years if profile else 0,
            "skills": json.loads(profile.skills_json) if (profile and profile.skills_json) else [],
            "current_company": profile.current_company if profile else None,
            "expected_salary": profile.expected_salary if profile else None,
            "preferred_location": profile.preferred_location if profile else None,
            "completion_pct": profile.completion_pct if profile else 20,
            "has_resume": has_resume,
            "total_invitations": total_invitations,
            "created_at": user.created_at,
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
#  Recruiter Details
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/recruiters")
def list_all_recruiters(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    recruiters = db.query(User, RecruiterProfile).outerjoin(
        RecruiterProfile, RecruiterProfile.user_id == User.id
    ).filter(User.role == "recruiter").order_by(User.created_at.desc()).all()

    result = []
    for user, profile in recruiters:
        job_count = db.query(Job).filter(Job.recruiter_id == user.id).count()
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "mobile": user.mobile,
            "company_name": profile.company_name if profile else None,
            "website": profile.website if profile else None,
            "description": profile.description if profile else None,
            "job_count": job_count,
            "created_at": user.created_at,
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
#  Job Management
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/jobs")
def list_all_jobs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, RecruiterProfile.user_id == Job.recruiter_id
    ).order_by(Job.created_at.desc()).all()

    result = []
    for job, rec_profile in jobs:
        invitation_count = db.query(CandidateInvitation).filter(
            CandidateInvitation.job_id == job.id
        ).count()
        result.append({
            "id": job.id,
            "title": job.title,
            "company_name": rec_profile.company_name if rec_profile else "Unknown",
            "recruiter_id": job.recruiter_id,
            "location": job.location,
            "experience_required": job.experience_required,
            "required_skills": json.loads(job.required_skills_json) if job.required_skills_json else [],
            "salary": job.salary,
            "employment_type": job.employment_type,
            "status": job.status,
            "invitation_count": invitation_count,
            "created_at": job.created_at,
        })
    return result


@router.patch("/jobs/{job_id}/toggle-status")
def admin_toggle_job_status(
    job_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "closed" if job.status == "active" else "active"
    db.commit()
    return {"id": job.id, "status": job.status}


# ─────────────────────────────────────────────────────────────────────────────
#  Review Management
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/reviews")
def list_reviews(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Review)
    if role:
        q = q.filter(Review.role == role)
    reviews = q.offset(skip).limit(limit).all()
    return [
        ReviewOut(
            id=r.id,
            reviewer_id=r.reviewer_id,
            target_user_id=r.target_user_id,
            rating=r.rating,
            comment=r.comment,
            role=r.role,
            created_at=r.created_at,
        )
        for r in reviews
    ]

@router.post("/reviews")
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    review = Review(
        reviewer_id=payload.reviewer_id,
        target_user_id=payload.target_user_id,
        rating=payload.rating,
        comment=payload.comment,
        role=payload.role,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        reviewer_id=review.reviewer_id,
        target_user_id=review.target_user_id,
        rating=review.rating,
        comment=review.comment,
        role=review.role,
        created_at=review.created_at,
    )

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(rev)
    db.commit()
    return {"message": f"Review {review_id} deleted"}

@router.get("/invitations")
def list_all_invitations(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(CandidateInvitation, User, Job).join(
        User, CandidateInvitation.candidate_id == User.id
    ).join(Job, CandidateInvitation.job_id == Job.id)

    if status_filter:
        q = q.filter(CandidateInvitation.status == status_filter)

    rows = q.order_by(CandidateInvitation.sent_at.desc()).all()

    result = []
    for inv, candidate, job in rows:
        result.append({
            "invitation_id": inv.id,
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name,
            "candidate_email": candidate.email,
            "job_id": job.id,
            "job_title": job.title,
            "match_score": inv.match_score,
            "status": inv.status,
            "sent_at": inv.sent_at,
            "responded_at": inv.responded_at,
        })
    return result


@router.get("/match-results")
def list_match_results(
    job_id: Optional[int] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(MatchResult, User, Job).join(
        User, MatchResult.candidate_id == User.id
    ).join(Job, MatchResult.job_id == Job.id)

    if job_id:
        q = q.filter(MatchResult.job_id == job_id)

    rows = q.order_by(MatchResult.match_score.desc()).limit(200).all()

    result = []
    for match, candidate, job in rows:
        result.append({
            "id": match.id,
            "job_id": job.id,
            "job_title": job.title,
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name,
            "match_score": match.match_score,
            "matching_skills": json.loads(match.matching_skills_json) if match.matching_skills_json else [],
            "skill_gap": json.loads(match.skill_gap_json) if match.skill_gap_json else [],
            "calculated_at": match.calculated_at,
        })
    return result
