import json
import uuid
from typing import List, Optional
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import RESUME_UPLOAD_DIR, PROFILE_PIC_UPLOAD_DIR

from app.models import (
    User, CandidateProfile, Resume, CandidateInvitation, Job, 
    RecruiterProfile, Notification, CreditTransaction, InterviewPrep, CommunicationAssessment
)
from app.schemas import CandidateProfileOut, CandidateProfileUpdate, InvitationOut, InvitationRespond, NotificationOut
from app.security import require_candidate, get_current_user
from app.services.resume_parser import extract_text_from_file, parse_resume_content
from app.services.ai_matcher import calculate_candidate_match
from app.services.notification_service import trigger_cascade_invitation, trigger_candidate_accepted_notification, trigger_interview_scheduled_notification
from app.services.ai_detector import check_ai_generated_content
from app.services.storage_service import save_uploaded_file


router = APIRouter(prefix="/api/candidate", tags=["Candidate Portal"])

def compute_completion_percentage(profile: CandidateProfile, has_resume: bool) -> int:
    score = 20
    if profile.education: score += 15
    if profile.skills_json and profile.skills_json != "[]": score += 15
    if profile.experience_years > 0: score += 10
    if profile.linkedin_url or profile.github_url: score += 10
    if has_resume: score += 15
    if profile.communication_score is not None: score += 15
    return min(100, score)


@router.get("/profile", response_model=CandidateProfileOut)
def get_candidate_profile(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id, completion_pct=20)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = json.loads(profile.skills_json) if profile.skills_json else []
    return CandidateProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        education=profile.education,
        experience_years=profile.experience_years,
        skills=skills,
        certifications=profile.certifications,
        projects=profile.projects,
        current_company=profile.current_company,
        expected_salary=profile.expected_salary,
        preferred_location=profile.preferred_location,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        portfolio_url=profile.portfolio_url,
        completion_pct=profile.completion_pct
    )

@router.put("/profile", response_model=CandidateProfileOut)
def update_candidate_profile(
    data: CandidateProfileUpdate,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    if data.education is not None: profile.education = data.education
    if data.experience_years is not None: profile.experience_years = data.experience_years
    if data.skills is not None: profile.skills_json = json.dumps(data.skills)
    if data.certifications is not None: profile.certifications = data.certifications
    if data.projects is not None: profile.projects = data.projects
    if data.current_company is not None: profile.current_company = data.current_company
    if data.expected_salary is not None: profile.expected_salary = data.expected_salary
    if data.preferred_location is not None: profile.preferred_location = data.preferred_location
    if data.linkedin_url is not None: profile.linkedin_url = data.linkedin_url
    if data.github_url is not None: profile.github_url = data.github_url
    if data.portfolio_url is not None: profile.portfolio_url = data.portfolio_url

    has_resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).first() is not None
    profile.completion_pct = compute_completion_percentage(profile, has_resume)

    db.commit()
    db.refresh(profile)

    return CandidateProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        education=profile.education,
        experience_years=profile.experience_years,
        skills=json.loads(profile.skills_json) if profile.skills_json else [],
        certifications=profile.certifications,
        projects=profile.projects,
        current_company=profile.current_company,
        expected_salary=profile.expected_salary,
        preferred_location=profile.preferred_location,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        portfolio_url=profile.portfolio_url,
        completion_pct=profile.completion_pct
    )

@router.get("/resume")
def get_candidate_resume(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        return {"has_resume": False}

    skills = json.loads(resume.extracted_skills_json) if resume.extracted_skills_json else []
    return {
        "has_resume": True,
        "id": resume.id,
        "file_name": resume.file_name,
        "file_path": resume.file_path,
        "extracted_skills": skills,
        "extracted_experience_years": resume.extracted_experience_years,
        "uploaded_at": resume.uploaded_at
    }

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resume files are supported.")

    content = await file.read()
    file_url, save_path = await save_uploaded_file(content, file.filename, "resumes")

    # Extract & parse ALL fields from resume
    raw_text = extract_text_from_file(save_path)
    parsed_data = parse_resume_content(raw_text)

    resume = Resume(
        candidate_id=current_user.id,
        file_path=file_url,
        file_name=file.filename,
        raw_text=raw_text,
        extracted_skills_json=json.dumps(parsed_data["skills"]),
        extracted_experience_years=parsed_data["experience_years"]
    )
    db.add(resume)

    # ── Auto-fill ALL extracted fields into candidate profile ──────────────────
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    # Merge skills (existing + extracted, deduplicated)
    existing_skills = json.loads(profile.skills_json) if profile.skills_json else []
    combined_skills = list(set(existing_skills + parsed_data["skills"]))
    profile.skills_json = json.dumps(combined_skills)

    # Experience: take the higher value
    if parsed_data["experience_years"] > (profile.experience_years or 0):
        profile.experience_years = parsed_data["experience_years"]

    # Education: fill only if currently empty
    if parsed_data.get("education") and not profile.education:
        profile.education = parsed_data["education"]

    # Current company: fill only if currently empty
    if parsed_data.get("current_company") and not profile.current_company:
        profile.current_company = parsed_data["current_company"]

    # Preferred location: fill only if currently empty
    if parsed_data.get("preferred_location") and not profile.preferred_location:
        profile.preferred_location = parsed_data["preferred_location"]

    # LinkedIn: fill only if currently empty
    if parsed_data.get("linkedin_url") and not profile.linkedin_url:
        profile.linkedin_url = parsed_data["linkedin_url"]

    # GitHub: fill only if currently empty
    if parsed_data.get("github_url") and not profile.github_url:
        profile.github_url = parsed_data["github_url"]

    profile.completion_pct = compute_completion_percentage(profile, has_resume=True)

    db.commit()

    # Trigger AI matching for candidate across all active jobs
    try:
        from app.services.ai_matcher import run_ai_matching_for_candidate
        run_ai_matching_for_candidate(db, current_user.id)
    except Exception as err:
        print(f"Error running candidate AI matching: {err}")

    return {

        "message": "Resume uploaded and processed successfully",
        "file_name": file.filename,
        "file_path": file_url,
        "extracted_skills": parsed_data["skills"],
        "extracted_experience_years": parsed_data["experience_years"],
        "extracted_education": parsed_data.get("education", ""),
        "extracted_current_company": parsed_data.get("current_company", ""),
        "extracted_preferred_location": parsed_data.get("preferred_location", ""),
        "extracted_linkedin_url": parsed_data.get("linkedin_url", ""),
        "extracted_github_url": parsed_data.get("github_url", ""),
    }


@router.get("/invitations", response_model=List[InvitationOut])
def get_candidate_invitations(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    invitations = db.query(CandidateInvitation, Job, RecruiterProfile).join(
        Job, CandidateInvitation.job_id == Job.id
    ).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(
        CandidateInvitation.candidate_id == current_user.id
    ).order_by(CandidateInvitation.sent_at.desc()).all()

    res = []
    for inv, job, rec_profile in invitations:
        interview_details = json.loads(inv.interview_details_json) if inv.interview_details_json else {}
        res.append(InvitationOut(
            id=inv.id,
            job_id=job.id,
            job_title=job.title,
            company_name=rec_profile.company_name if rec_profile else "Company",
            job_description=job.description,
            experience_required=job.experience_required,
            salary=job.salary,
            location=job.location,
            match_score=inv.match_score,
            status=inv.status,
            sent_at=inv.sent_at,
            interview_date=interview_details.get("date"),
            interview_time=interview_details.get("time"),
            location_or_link=interview_details.get("location_or_link"),
            interview_message=interview_details.get("message")
        ))
    return res

@router.post("/invitations/{invitation_id}/respond")
def respond_to_invitation(
    invitation_id: int,
    payload: InvitationRespond,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    invitation = db.query(CandidateInvitation).filter(
        CandidateInvitation.id == invitation_id,
        CandidateInvitation.candidate_id == current_user.id
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    action = payload.action.lower()
    if action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'accept' or 'reject'")

    # Credit deduction when accepting invitation (1 point reduced)
    if action == "accept" and invitation.status == "pending":
        if (current_user.credits or 0) < 1:
            raise HTTPException(
                status_code=400,
                detail="Insufficient credit balance (1 credit required to accept an invitation)."
            )
        current_user.credits = (current_user.credits or 0) - 1
        db.add(CreditTransaction(
            user_id=current_user.id,
            amount=-1,
            balance_after=current_user.credits,
            reason="accept_invitation"
        ))

    invitation.responded_at = datetime.utcnow()
    job = db.query(Job).filter(Job.id == invitation.job_id).first()

    auto_scheduled = False
    if action == "accept":
        # Check recruiter auto-schedule settings
        rec_profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == job.recruiter_id).first() if job else None
        
        if rec_profile and rec_profile.auto_schedule_interviews:
            # Full automation: Calculate next business slot (2 days ahead)
            from datetime import timedelta
            interview_dt = datetime.utcnow() + timedelta(days=2)
            if interview_dt.weekday() >= 5:  # Saturday/Sunday -> move to Monday
                interview_dt += timedelta(days=(7 - interview_dt.weekday()))

            meet_code = f"{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}"
            meet_link = f"https://meet.google.com/hri-{meet_code}"
            time_slot = rec_profile.preferred_interview_time or "10:00 AM"
            date_str = interview_dt.strftime("%b %d, %Y")

            interview_details = {
                "date": date_str,
                "time": time_slot,
                "location_or_link": meet_link,
                "message": f"Congratulations! Your interview for '{job.title}' has been automatically scheduled by {rec_profile.company_name}'s AI Smart Scheduler.",
                "auto_scheduled": True
            }

            invitation.status = "interview_scheduled"
            invitation.interview_details_json = json.dumps(interview_details)
            auto_scheduled = True

            # Candidate notification
            db.add(Notification(
                user_id=current_user.id,
                title=f"📅 Interview Scheduled: {job.title}",
                message=f"Your interview with {rec_profile.company_name} is set for {date_str} at {time_slot}. Meeting Link: {meet_link}",
                type="interview_invite"
            ))

            # Recruiter notification
            db.add(Notification(
                user_id=job.recruiter_id,
                title=f"⚡ Interview Auto-Scheduled: {current_user.full_name}",
                message=f"{current_user.full_name} accepted your invitation! AI Auto-Scheduler booked the interview for {date_str} at {time_slot}.",
                type="status_change"
            ))
        else:
            invitation.status = "interested"
            if job:
                rec_notif = Notification(
                    user_id=job.recruiter_id,
                    title=f"Candidate Accepted: {current_user.full_name}",
                    message=f"{current_user.full_name} has ACCEPTED your invitation for '{job.title}'. Click '⚡ Smart Schedule' to confirm interview time.",
                    type="status_change"
                )
                db.add(rec_notif)
    else:
        invitation.status = "rejected"
        if job:
            rec_notif = Notification(
                user_id=job.recruiter_id,
                title=f"Candidate Declined: {current_user.full_name}",
                message=f"{current_user.full_name} has declined the invitation for '{job.title}'.",
                type="status_change"
            )
            db.add(rec_notif)

    # CASCADE TRIGGER: If candidate rejected, trigger auto-cascade to invite next best candidate!
    cascade_triggered = False
    if action == "reject" and job:
        trigger_cascade_invitation(db, job.id, current_user.id)
        cascade_triggered = True

    db.commit()
    db.refresh(invitation)

    # Async Email Delivery for live production
    if action == "accept":
        if auto_scheduled:
            trigger_interview_scheduled_notification(db, invitation.id)
        else:
            trigger_candidate_accepted_notification(db, invitation.id)

    return {
        "invitation_id": invitation.id,
        "status": invitation.status,
        "auto_scheduled": auto_scheduled,
        "remaining_credits": current_user.credits,
        "cascade_triggered": cascade_triggered
    }



@router.post("/apply/{job_id}")
def apply_to_job(job_id: int, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    if (current_user.credits or 0) < 1:
        raise HTTPException(status_code=400, detail="Insufficient credits to apply. 1 credit required per application.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    cand_skills = []
    if profile and profile.skills_json:
        try:
            cand_skills = json.loads(profile.skills_json)
        except Exception:
            cand_skills = []
    if resume and resume.extracted_skills_json:
        try:
            extracted = json.loads(resume.extracted_skills_json)
            cand_skills = list(set(cand_skills + extracted))
        except Exception:
            pass
    cand_exp = profile.experience_years if profile else 0.0
    resume_text = resume.raw_text if resume else ""

    match_res = calculate_candidate_match(
        job_title=job.title,
        job_description=job.description,
        required_skills=json.loads(job.required_skills_json) if job.required_skills_json else [],
        experience_required=job.experience_required,
        candidate_skills=cand_skills,
        candidate_experience=cand_exp,
        resume_text=resume_text,
    )

    invitation = CandidateInvitation(
        job_id=job.id,
        candidate_id=current_user.id,
        match_score=match_res["match_score"],
        status="pending",
    )
    db.add(invitation)

    current_user.credits -= 1
    tx = CreditTransaction(
        user_id=current_user.id,
        amount=-1,
        balance_after=current_user.credits,
        reason="job_apply",
    )
    db.add(tx)

    notif = Notification(
        user_id=job.recruiter_id,
        title=f"New application for {job.title}",
        message=f"{current_user.full_name} applied for your job.",
        type="application",
    )
    db.add(notif)

    db.commit()
    db.refresh(invitation)
    return {"invitation_id": invitation.id, "match_score": invitation.match_score}

@router.put("/open_to_work")
def toggle_open_to_work(open_status: bool, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.is_open_to_work = open_status
    profile.last_active_at = datetime.utcnow()
    db.commit()
    return {"open_to_work": profile.is_open_to_work}

@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    if ext not in ['jpg', 'jpeg', 'png', 'webp']:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.")

    contents = await file.read()
    file_url, _ = await save_uploaded_file(contents, file.filename, "profile_pics")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id, profile_pic_url=file_url)
        db.add(profile)
    else:
        profile.profile_pic_url = file_url

    # Also update user record if applicable
    current_user.profile_pic_url = file_url

    db.commit()
    return {"message": "Profile picture updated successfully", "profile_pic_url": file_url}

@router.delete("/profile-picture")
def delete_profile_picture(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile:
        profile.profile_pic_url = None
        db.commit()
    return {"message": "Profile picture removed successfully"}


@router.post("/interview-prep/{invitation_id}")
def generate_interview_prep(
    invitation_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    invitation = db.query(CandidateInvitation).filter(
        CandidateInvitation.id == invitation_id,
        CandidateInvitation.candidate_id == current_user.id
    ).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.status not in ["interested", "interview_scheduled"]:
        raise HTTPException(status_code=400, detail="Interview prep can only be generated for accepted invitations")

    # Check if already generated
    existing = db.query(InterviewPrep).filter(InterviewPrep.invitation_id == invitation.id).first()
    if existing:
        return {
            "invitation_id": invitation.id,
            "questions": json.loads(existing.questions_json),
            "tips": json.loads(existing.tips_json),
            "generated_at": existing.generated_at
        }

    job = db.query(Job).filter(Job.id == invitation.job_id).first()
    company_name = job.recruiter.recruiter_profile.company_name if (job and job.recruiter and job.recruiter.recruiter_profile) else "Company"

    req_skills = json.loads(job.required_skills_json) if (job and job.required_skills_json) else []
    skills_str = ", ".join(req_skills[:3]) if req_skills else "relevant software skills"

    questions = [
        f"Tell us about your background and why you are interested in the role of '{job.title}' at {company_name}.",
        f"How have you applied key technologies like {skills_str} in your previous projects?",
        f"Walk us through a major technical challenge you solved as a {job.title} and the exact steps you took.",
        "How do you handle tight deadlines, technical debt, and collaboration with team members during project delivery?"
    ]
    tips = [
        f"Research recent developments at {company_name} and align your answers with their core domain.",
        "Use the STAR method (Situation, Task, Action, Result) to structure all technical and behavioral answers.",
        f"Highlight hands-on experience with {skills_str} and mention measurable business outcomes.",
        "Prepare 2-3 insightful questions to ask the recruiter at the end of the interview."
    ]

    prep = InterviewPrep(
        invitation_id=invitation.id,
        candidate_id=current_user.id,
        job_id=job.id if job else invitation.job_id,
        questions_json=json.dumps(questions),
        tips_json=json.dumps(tips)
    )
    db.add(prep)
    db.commit()
    db.refresh(prep)

    return {
        "invitation_id": invitation.id,
        "job_title": job.title if job else "",
        "company_name": company_name,
        "job_description": job.description if job else "",
        "required_skills": req_skills,
        "questions": questions,
        "tips": tips,
        "generated_at": prep.generated_at
    }


@router.get("/interview-prep/{invitation_id}")
def get_interview_prep(
    invitation_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    prep = db.query(InterviewPrep).filter(
        InterviewPrep.invitation_id == invitation_id,
        InterviewPrep.candidate_id == current_user.id
    ).first()
    if not prep:
        return {"has_prep": False}
    
    job = db.query(Job).filter(Job.id == prep.job_id).first()
    company_name = job.recruiter.recruiter_profile.company_name if (job and job.recruiter and job.recruiter.recruiter_profile) else "Company"
    req_skills = json.loads(job.required_skills_json) if (job and job.required_skills_json) else []

    return {
        "has_prep": True,
        "job_title": job.title if job else "",
        "company_name": company_name,
        "job_description": job.description if job else "",
        "required_skills": req_skills,
        "questions": json.loads(prep.questions_json),
        "tips": json.loads(prep.tips_json),
        "generated_at": prep.generated_at
    }


@router.post("/communication-assessment")
def submit_communication_assessment(
    answers: List[dict],
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    scores = [float(a.get("score", 80)) for a in answers] if answers else [85.0]
    avg_score = round(sum(scores) / len(scores), 1)

    profile.communication_score = avg_score

    assessment = CommunicationAssessment(
        candidate_id=current_user.id,
        answers_json=json.dumps(answers),
        score=avg_score,
        feedback="Clear communication style, strong structure, and high technical terminology precision."
    )
    db.add(assessment)
    db.commit()
    return {"communication_score": profile.communication_score, "feedback": assessment.feedback}

@router.post("/claim-referral")
def claim_referral_code(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ref_code = (payload.get("referral_code") or "").strip()
    if not ref_code:
        raise HTTPException(status_code=400, detail="Referral code is required.")
    if current_user.referred_by:
        raise HTTPException(status_code=400, detail="You have already claimed a referral code.")

    referrer = db.query(User).filter(User.referral_code == ref_code).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code.")
    if referrer.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot refer yourself.")

    current_user.referred_by = ref_code
    current_user.credits += 5
    referrer.credits += 10

    db.add(CreditTransaction(user_id=current_user.id, amount=5, balance_after=current_user.credits, reason="referral_bonus"))
    db.add(CreditTransaction(user_id=referrer.id, amount=10, balance_after=referrer.credits, reason="referral_reward"))
    db.add(Notification(user_id=referrer.id, title="Referral Reward!", message=f"{current_user.full_name} registered with your referral code. You received 10 credits!", type="info"))
    db.commit()

    return {"message": "Referral code applied successfully!", "new_credits": current_user.credits}

@router.get("/notifications", response_model=List[NotificationOut])
def get_user_notifications(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return notifs

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}


# ─── Match Score for a Specific Job ───────────────────────────────────────────
@router.get("/match-score/{job_id}")
def get_match_score_for_job(
    job_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Compute & return on-the-fly match score for the logged-in candidate
    against a specific job. Used by the Career page Apply popup.
    """
    job_tuple = db.query(Job, RecruiterProfile).outerjoin(
        RecruiterProfile, Job.recruiter_id == RecruiterProfile.user_id
    ).filter(Job.id == job_id, Job.status == "active").first()

    if not job_tuple:
        raise HTTPException(status_code=404, detail="Job not found")

    job, rec_profile = job_tuple
    company_name = rec_profile.company_name if rec_profile else "Company"

    # Load candidate profile & resume
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    cand_skills = json.loads(profile.skills_json) if (profile and profile.skills_json) else []
    cand_exp = profile.experience_years if profile else 0.0
    resume_text = resume.raw_text if resume else ""

    if resume and resume.extracted_skills_json:
        extracted = json.loads(resume.extracted_skills_json)
        cand_skills = list(set(cand_skills + extracted))

    req_skills = json.loads(job.required_skills_json) if job.required_skills_json else []

    result = calculate_candidate_match(
        job_title=job.title,
        job_description=job.description,
        required_skills=req_skills,
        experience_required=job.experience_required,
        candidate_skills=cand_skills,
        candidate_experience=cand_exp,
        resume_text=resume_text
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company_name": company_name,
        "location": job.location,
        "salary": job.salary,
        "match_score": result["match_score"],
        "matching_skills": result["matching_skills"],
        "skill_gap": result["skill_gap"],
        "required_skills": req_skills,
        "is_invited": db.query(CandidateInvitation).filter(
            CandidateInvitation.job_id == job_id,
            CandidateInvitation.candidate_id == current_user.id
        ).first() is not None
    }


# ─── AI Mock Interview Chat ────────────────────────────────────────────────────
@router.post("/interview-chat")
def evaluate_interview_answer(
    payload: dict,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Evaluates a candidate's answer to an interview question.
    Returns score (0-100), feedback, and improvement suggestions.
    Uses keyword-based + length-based heuristics (no external LLM needed).
    """
    import re

    question: str = payload.get("question", "")
    answer: str = payload.get("answer", "").strip()
    job_title: str = payload.get("job_title", "the role")
    job_description: str = payload.get("job_description", "")
    required_skills: list = payload.get("required_skills", [])

    if not answer:
        return {
            "score": 0,
            "feedback": "No answer provided.",
            "suggestions": ["Please type your answer before submitting."],
            "model_answer_hint": "",
            "grade": "F"
        }

    # ── Keyword extraction from question + job context ──────────────────
    combined_context = f"{question} {job_title} {job_description} {' '.join(required_skills)}".lower()
    # Extract meaningful words (>3 chars, not stop words)
    stop_words = {"with", "that", "have", "this", "from", "your", "what", "when", "where",
                  "would", "could", "should", "about", "there", "their", "these", "were",
                  "been", "will", "into", "more", "also", "you", "the", "and", "for",
                  "are", "can", "how", "why", "not", "but", "our", "was", "any"}
    context_words = set(
        w for w in re.findall(r'\b[a-z]{4,}\b', combined_context)
        if w not in stop_words
    )
    skill_words = set(s.lower().strip() for s in required_skills if s.strip())
    all_keywords = context_words | skill_words

    answer_lower = answer.lower()
    answer_words = set(re.findall(r'\b[a-z]{4,}\b', answer_lower))

    # ── Scoring dimensions ───────────────────────────────────────────────
    # 1. Keyword relevance (40%)
    if all_keywords:
        keyword_hits = len(all_keywords.intersection(answer_words))
        keyword_score = min(100.0, (keyword_hits / max(len(all_keywords) * 0.3, 1)) * 100)
    else:
        keyword_score = 70.0

    # 2. Answer length / thoroughness (30%)
    word_count = len(answer.split())
    if word_count >= 80:
        length_score = 100.0
    elif word_count >= 40:
        length_score = 80.0
    elif word_count >= 20:
        length_score = 60.0
    elif word_count >= 10:
        length_score = 40.0
    else:
        length_score = 20.0

    # 3. Structure quality (30%) — checks for STAR method indicators, examples
    structure_keywords = ["example", "situation", "result", "achieved", "implemented",
                          "project", "team", "led", "built", "developed", "solved",
                          "reduced", "improved", "increased", "managed", "designed"]
    structure_hits = sum(1 for kw in structure_keywords if kw in answer_lower)
    structure_score = min(100.0, structure_hits * 15)

    composite = (keyword_score * 0.40) + (length_score * 0.30) + (structure_score * 0.30)
    final_score = round(min(100.0, max(10.0, composite)), 1)

    # ── Grade ─────────────────────────────────────────────────────────────
    if final_score >= 85:
        grade, grade_label = "A", "Excellent"
    elif final_score >= 70:
        grade, grade_label = "B", "Good"
    elif final_score >= 55:
        grade, grade_label = "C", "Average"
    elif final_score >= 40:
        grade, grade_label = "D", "Needs Improvement"
    else:
        grade, grade_label = "F", "Poor"

    # ── Feedback generation ───────────────────────────────────────────────
    missing_skills = [s for s in required_skills if s.lower() not in answer_lower][:3]

    if final_score >= 85:
        feedback = f"Excellent answer! You demonstrated strong understanding of the requirements for {job_title}."
    elif final_score >= 70:
        feedback = f"Good response! You covered the key aspects well. A bit more depth or specific examples would strengthen it."
    elif final_score >= 55:
        feedback = f"Average response. Your answer addresses the question but lacks specifics. Try to include concrete examples using the STAR method."
    elif final_score >= 40:
        feedback = f"Your answer needs improvement. It seems too brief or generic for a {job_title} role. Expand on your experience and use specific examples."
    else:
        feedback = f"This answer is too short or lacks relevance. For a {job_title} position, interviewers expect detailed, experience-backed responses."

    suggestions = []
    if word_count < 40:
        suggestions.append("📝 Expand your answer — aim for at least 40-60 words with specific examples.")
    if structure_hits < 2:
        suggestions.append("⭐ Use the STAR method: Situation → Task → Action → Result.")
    if missing_skills:
        suggestions.append(f"💡 Mention these relevant skills/keywords: {', '.join(missing_skills)}.")
    if keyword_score < 50:
        suggestions.append("🎯 Align your answer more closely with the job requirements and role context.")
    if not suggestions:
        suggestions.append("✅ Keep this up! Try to maintain this quality for all questions.")

    # ── Model answer hint ─────────────────────────────────────────────────
    skill_hint = ", ".join(required_skills[:3]) if required_skills else "relevant technologies"
    model_answer_hint = (
        f"A strong answer would: (1) briefly describe a relevant situation/project, "
        f"(2) explain your specific role and actions using {skill_hint}, "
        f"(3) quantify the outcome or impact, and (4) connect it to the requirements of {job_title}."
    )

    return {
        "score": final_score,
        "grade": grade,
        "grade_label": grade_label,
        "feedback": feedback,
        "suggestions": suggestions,
        "model_answer_hint": model_answer_hint,
        "keyword_score": round(keyword_score, 1),
        "length_score": round(length_score, 1),
        "structure_score": round(structure_score, 1),
        "word_count": word_count
    }


# ─── Communication Skill Assessment Endpoints ─────────────────────────

COMMUNICATION_TEST_QUESTIONS = [
    {
        "id": 1,
        "category": "Self Introduction & Professional Overview",
        "question": "Please introduce yourself and briefly explain your background, core technical skills, and career journey so far.",
        "eval_criteria": "Clear articulation of professional background, key technical skills, and confident tone."
    },
    {
        "id": 2,
        "category": "Problem Solving & Critical Thinking",
        "question": "Describe a challenging technical problem or project setback you faced recently. How did you handle it and what was the result?",
        "eval_criteria": "Use of STAR method (Situation, Task, Action, Result), problem-solving clarity, and ownership."
    },
    {
        "id": 3,
        "category": "Team Collaboration & Interpersonal Skill",
        "question": "How do you handle a difference of opinion or technical disagreement with a team member or project manager?",
        "eval_criteria": "Active listening, empathy, constructive discussion skills, and focus on team goals."
    },
    {
        "id": 4,
        "category": "Adaptability & Continuous Learning",
        "question": "Technology and frameworks evolve rapidly. How do you approach learning new technologies and adapting under tight deadlines?",
        "eval_criteria": "Growth mindset, structured self-learning approach, and stress resilience."
    },
    {
        "id": 5,
        "category": "Future Vision & Value Contribution",
        "question": "What are your core career goals for the next 2-3 years, and what primary value will you bring to a fast-growing engineering team?",
        "eval_criteria": "Clarity of purpose, motivation, team value alignment, and professional maturity."
    }
]

@router.get("/communication-assessment/questions")
def get_communication_assessment_questions(current_user: User = Depends(require_candidate)):
    """Return 5 standard communication test questions."""
    return {"questions": COMMUNICATION_TEST_QUESTIONS}

@router.post("/communication-assessment/submit")
def submit_communication_assessment(
    payload: dict,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Evaluates 5 candidate answers for Communication Level (fluency, vocabulary, sentence structure, coherence, clarity).
    Updates CandidateProfile.communication_score and sets completion_pct = 100%.
    """
    answers = payload.get("answers", [])
    if not answers or len(answers) < 1:
        raise HTTPException(status_code=400, detail="Please provide responses to the assessment questions.")

    evaluated_qns = []
    total_score = 0.0

    action_words = [
        "implemented", "developed", "architected", "resolved", "collaborated", 
        "optimized", "spearheaded", "designed", "leadership", "communicated",
        "strategy", "scalable", "efficiency", "achieved", "analyzed", "experience"
    ]
    coherence_words = ["because", "therefore", "overall", "specifically", "as a result", "furthermore", "for instance"]

    for ans_item in answers:
        q_id = ans_item.get("question_id")
        ans_text = (ans_item.get("answer_text") or "").strip()

        # Check for AI-Generated Content / LLM Boilerplate
        ai_check = check_ai_generated_content(ans_text)
        if ai_check["is_ai"]:
            raise HTTPException(
                status_code=400,
                detail=f"🚨 AI-Generated Content Detected on Question {q_id}! ({ai_check['reason']}). Please click 'Re-attempt' and answer in your own genuine human words."
            )

        q_obj = next((q for q in COMMUNICATION_TEST_QUESTIONS if q["id"] == q_id), COMMUNICATION_TEST_QUESTIONS[0])
        
        words = ans_text.split()

        w_count = len(words)

        # 1. Fluency & Length (30%)
        if w_count >= 50:
            fluency_score = 100
        elif w_count >= 30:
            fluency_score = 85
        elif w_count >= 15:
            fluency_score = 65
        else:
            fluency_score = 35

        # 2. Vocabulary & Terminology (30%)
        lower_ans = ans_text.lower()
        voc_hits = sum(1 for w in action_words if w in lower_ans)
        voc_score = min(100, 50 + (voc_hits * 15))

        # 3. Structure & Coherence (25%)
        coh_hits = sum(1 for w in coherence_words if w in lower_ans)
        struct_score = min(100, 60 + (coh_hits * 20))

        # 4. Relevance & Expression (15%)
        relevance_score = 90 if w_count >= 25 else 50

        q_score = (fluency_score * 0.30) + (voc_score * 0.30) + (struct_score * 0.25) + (relevance_score * 0.15)
        total_score += q_score

        evaluated_qns.append({
            "question_id": q_id,
            "category": q_obj["category"],
            "question": q_obj["question"],
            "answer_text": ans_text,
            "score": round(q_score, 1),
            "word_count": w_count
        })

    avg_score = round(total_score / len(answers), 1)

    if avg_score >= 85:
        level_label = "Advanced / Fluent Communicator (A+)"
        feedback = "Outstanding communication skills! You express complex ideas with exceptional clarity, strong professional vocabulary, and coherent structure."
    elif avg_score >= 70:
        level_label = "Proficient / Clear Communicator (B+)"
        feedback = "Great communication skills! You communicate ideas effectively with good professional terminology and clear organization."
    elif avg_score >= 55:
        level_label = "Intermediate Communicator (C)"
        feedback = "Decent communication skills. You convey your points well, but expanding your answers with more action verbs and structured examples will help boost your impact."
    else:
        level_label = "Basic Communicator (D)"
        feedback = "Basic communication level. Focus on structuring your answers using the STAR method and providing more descriptive details."

    # Update candidate profile
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    profile.communication_score = avg_score
    profile.communication_assessment_json = json.dumps({
        "overall_score": avg_score,
        "level_label": level_label,
        "feedback": feedback,
        "evaluated_at": datetime.utcnow().isoformat(),
        "questions": evaluated_qns
    })

    resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).first()
    profile.completion_pct = compute_completion_percentage(profile, has_resume=bool(resume))

    db.commit()

    return {
        "communication_score": avg_score,
        "level_label": level_label,
        "feedback": feedback,
        "completion_pct": profile.completion_pct,
        "evaluated_questions": evaluated_qns
    }

@router.get("/communication-assessment/result")
def get_communication_assessment_result(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile or not profile.communication_assessment_json:
        return {"has_completed": False, "communication_score": profile.communication_score if profile else None}

    details = json.loads(profile.communication_assessment_json)
    details["has_completed"] = True
    details["communication_score"] = profile.communication_score
    return details


# ─────────────────────────────────────────────────────────────────────────────
#  Candidate Inactivity Detection & "Open to Work" Smart Retention Pop-up
# ─────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel as PyBaseModel

class OpenToWorkUpdate(PyBaseModel):
    is_open_to_work: bool

@router.get("/inactivity-check")
def check_candidate_inactivity(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Checks if candidate hasn't accessed the platform for >= 7 days.
    Returns prompt_needed = True so the mobile/web pop-up modal triggers.
    """
    from datetime import datetime as dt
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        return {"prompt_needed": False, "days_inactive": 0, "is_open_to_work": True}

    now = dt.utcnow()
    days_inactive = 0
    if profile.last_active_at:
        days_inactive = (now - profile.last_active_at).days
    else:
        days_inactive = 8

    # Trigger pop-up if inactive >= 7 days
    prompt_needed = (days_inactive >= 7)

    return {
        "prompt_needed": prompt_needed,
        "days_inactive": days_inactive,
        "is_open_to_work": profile.is_open_to_work,
        "last_active_at": profile.last_active_at.isoformat() if profile.last_active_at else None
    }

@router.patch("/open-to-work")
def update_open_to_work_status(
    data: OpenToWorkUpdate,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Updates the candidate's Open to Work (Active 🟢 / Inactive 🔴) status and resets last_active_at.
    """
    from datetime import datetime as dt
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    profile.is_open_to_work = data.is_open_to_work
    profile.last_active_at = dt.utcnow()
    db.commit()

    status_label = "🟢 Actively Open to Work" if data.is_open_to_work else "🔴 Inactive / Not Looking"
    return {
        "message": f"Your status has been updated to: {status_label}",
        "is_open_to_work": profile.is_open_to_work,
        "last_active_at": profile.last_active_at.isoformat()
    }

@router.post("/simulate-inactivity")
def simulate_candidate_inactivity(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Test utility: sets candidate last_active_at to 9 days ago for instant testing of the pop-up.
    """
    from datetime import datetime as dt, timedelta
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile:
        profile.last_active_at = dt.utcnow() - timedelta(days=9)
        db.commit()
    return {"message": "Simulated 9 days of inactivity.", "days_inactive": 9}


# ─────────────────────────────────────────────────────────────────────────────
#  Candidate Profile Picture Management (Upload / Update / Remove)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/profile-picture")
async def upload_candidate_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Uploads or replaces the candidate profile avatar photo.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supported image formats are PNG, JPG, JPEG, WEBP, and SVG."
        )

    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    save_path = PROFILE_PIC_UPLOAD_DIR / filename

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Profile picture must be less than 5MB.")

    with open(save_path, "wb") as f:
        f.write(content)

    file_url = f"/uploads/profile_pics/{filename}"
    current_user.profile_pic_url = file_url
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture updated successfully!",
        "profile_pic_url": file_url
    }

@router.delete("/profile-picture")
def remove_candidate_profile_picture(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """
    Removes the candidate profile avatar photo.
    """
    current_user.profile_pic_url = None
    db.commit()
    return {"message": "Profile picture removed successfully!"}


# ─── 🔗 PUBLIC SHAREABLE PROFILE (LinkedIn Style) ────────────────────────────

@router.get("/public-profile/{user_id}")
def get_public_candidate_profile(user_id: int, db: Session = Depends(get_db)):
    """Publicly accessible profile page view (e.g. for /in/:id) with skills, projects, and voice scores."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "candidate":
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    resume = db.query(Resume).filter(Resume.candidate_id == user_id).order_by(Resume.uploaded_at.desc()).first()

    skills = json.loads(profile.skills_json) if profile and profile.skills_json else []
    certifications = json.loads(profile.certifications) if profile and profile.certifications and profile.certifications.startswith("[") else profile.certifications if profile else ""
    projects = json.loads(profile.projects) if profile and profile.projects and profile.projects.startswith("[") else profile.projects if profile else ""

    profile_pic = user.profile_pic_url or (profile.profile_pic_url if profile else "")

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "profile_pic_url": profile_pic,
        "is_open_to_work": bool(profile.is_open_to_work) if profile else False,
        "education": profile.education if profile else "Not specified",
        "experience_years": profile.experience_years if profile else 0.0,
        "current_company": profile.current_company if profile else "Independent Professional",
        "expected_salary": profile.expected_salary if profile else "Competitive",
        "preferred_location": profile.preferred_location if profile else "Flexible / Remote",
        "skills": skills,
        "certifications": certifications,
        "projects": projects,
        "linkedin_url": profile.linkedin_url if profile else None,
        "github_url": profile.github_url if profile else None,
        "portfolio_url": profile.portfolio_url if profile else None,
        "communication_score": profile.communication_score if profile else None,
        "completion_pct": profile.completion_pct if profile else 50,
        "has_resume": resume is not None,
        "resume_url": resume.file_path if resume else None,
        "joined_at": user.created_at.strftime("%B %Y") if user.created_at else "2026"
    }


# ─── ⚡ 1-CLICK EASY APPLY WITH LIVE AI FIT ──────────────────────────────────

@router.post("/easy-apply/{job_id}")
def easy_apply_job(
    job_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """1-Click instant job application with immediate AI match calculation."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    # Check if already applied or invited
    existing = db.query(CandidateInvitation).filter(
        CandidateInvitation.job_id == job_id,
        CandidateInvitation.candidate_id == current_user.id
    ).first()

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    resume = db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    cand_skills = json.loads(profile.skills_json) if profile and profile.skills_json else []
    cand_exp = profile.experience_years if profile else 0.0
    resume_text = resume.raw_text if resume else ""

    # Compute live match score
    match_res = calculate_candidate_match(
        job_title=job.title,
        job_description=job.description,
        required_skills=json.loads(job.required_skills_json) if job.required_skills_json else [],
        experience_required=job.experience_required,
        candidate_skills=cand_skills,
        candidate_experience=cand_exp,
        resume_text=resume_text
    )

    match_score = match_res["match_score"]

    if existing:
        if existing.status in ["rejected", "interview_rejected"]:
            existing.status = "interested"
            existing.match_score = match_score
            db.commit()
            return {"status": "reapplied", "match_score": match_score, "message": "Application resubmitted successfully!"}
        return {"status": "already_applied", "match_score": existing.match_score, "message": f"You already have an active application ({existing.status})"}

    new_invitation = CandidateInvitation(
        job_id=job.id,
        candidate_id=current_user.id,
        match_score=match_score,
        status="interested"
    )
    db.add(new_invitation)

    # In-app notification for Recruiter
    notif = Notification(
        user_id=job.recruiter_id,
        title=f"⚡ 1-Click Easy Apply: {current_user.full_name}",
        message=f"{current_user.full_name} submitted an instant application for '{job.title}' with {match_score}% AI fit score.",
        type="application"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_invitation)

    # Trigger async notification to recruiter
    trigger_candidate_accepted_notification(db, new_invitation.id)

    return {
        "status": "applied",
        "match_score": match_score,
        "matching_skills": match_res.get("matching_skills", []),
        "missing_skills": match_res.get("missing_skills", []),
        "message": f"🎉 Easy Apply submitted successfully! AI Match: {match_score}%"
    }




