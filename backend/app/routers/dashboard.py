from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Job, CandidateInvitation, CandidateProfile, Resume
from app.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Analytics"])

@router.get("/recruiter")
def get_recruiter_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "recruiter":
        return {}

    posted_jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).all()
    job_ids = [j.id for j in posted_jobs]

    total_jobs = len(posted_jobs)
    active_jobs = sum(1 for j in posted_jobs if j.status == "active")
    closed_jobs = sum(1 for j in posted_jobs if j.status == "closed")

    pending_responses = 0
    interested_candidates = 0
    rejected_candidates = 0

    if job_ids:
        invitations = db.query(CandidateInvitation).filter(CandidateInvitation.job_id.in_(job_ids)).all()
        pending_responses = sum(1 for inv in invitations if inv.status == "pending")
        interested_candidates = sum(1 for inv in invitations if inv.status == "interested")
        rejected_candidates = sum(1 for inv in invitations if inv.status == "rejected")

    # Chart Funnel Data
    funnel_data = [
        {"name": "Total Shortlisted", "value": pending_responses + interested_candidates + rejected_candidates},
        {"name": "Pending", "value": pending_responses},
        {"name": "Interested", "value": interested_candidates},
        {"name": "Rejected", "value": rejected_candidates}
    ]

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "closed_jobs": closed_jobs,
        "pending_responses": pending_responses,
        "interested_candidates": interested_candidates,
        "funnel_data": funnel_data
    }

@router.get("/candidate")
def get_candidate_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "candidate":
        return {}

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    has_resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).first() is not None

    invitations = db.query(CandidateInvitation).filter(CandidateInvitation.candidate_id == current_user.id).all()

    total_invitations = len(invitations)
    pending_count = sum(1 for inv in invitations if inv.status == "pending")
    interested_count = sum(1 for inv in invitations if inv.status == "interested")
    rejected_count = sum(1 for inv in invitations if inv.status == "rejected")

    invitation_chart = [
        {"status": "Pending", "count": pending_count},
        {"status": "Interested", "count": interested_count},
        {"status": "Rejected", "count": rejected_count}
    ]

    return {
        "completion_pct": profile.completion_pct if profile else 20,
        "has_resume": has_resume,
        "is_open_to_work": profile.is_open_to_work if profile else True,
        "last_active_at": profile.last_active_at.isoformat() if (profile and profile.last_active_at) else None,
        "total_invitations": total_invitations,
        "pending_count": pending_count,
        "interested_count": interested_count,
        "rejected_count": rejected_count,
        "invitation_chart": invitation_chart
    }

