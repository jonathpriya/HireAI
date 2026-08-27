import json
import smtplib
import threading
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Job, User, MatchResult, CandidateInvitation, Notification, RecruiterProfile, CandidateProfile
from app.config import SMTP_SENDER, SMTP_PASSWORD, SMTP_SERVER, SMTP_PORT, FRONTEND_URL

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
#  Non-Blocking Async Email Engine (Threaded Dispatch)
# ─────────────────────────────────────────────────────────────────────────────

def _dispatch_email_worker(to_email: str, subject: str, html_body: str):
    """Worker function executed in background thread so API responses return in < 50ms."""
    if not (SMTP_SENDER and SMTP_PASSWORD):
        logger.info(f"[Email Sim] To: {to_email} | Subject: {subject}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"HireAI <{SMTP_SENDER}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=12) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_SENDER, SMTP_PASSWORD)
            server.sendmail(SMTP_SENDER, to_email, msg.as_string())
        logger.info(f"✓ Real Email successfully dispatched to {to_email}: {subject}")
    except Exception as e:
        logger.warning(f"Email delivery failed to {to_email}: {e}")


def send_email_async(to_email: str, subject: str, html_body: str):
    """Spawns non-blocking thread for email delivery."""
    t = threading.Thread(target=_dispatch_email_worker, args=(to_email, subject, html_body), daemon=True)
    t.start()


# ─────────────────────────────────────────────────────────────────────────────
#  Professional Responsive HTML Email Templates
# ─────────────────────────────────────────────────────────────────────────────

def _base_email_wrapper(title_icon: str, title: str, subtitle: str, content_html: str, action_text: str = "Go to HireAI Portal", action_url: str = FRONTEND_URL) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {{ margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
        .wrapper {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
        .header {{ background: linear-gradient(135deg, #0a66c2 0%, #2563eb 100%); padding: 32px 28px; color: #ffffff; text-align: center; }}
        .body {{ padding: 32px 28px; color: #0f172a; font-size: 15px; line-height: 1.6; }}
        .btn {{ display: inline-block; padding: 14px 32px; background: #0a66c2; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 20px; }}
        .footer {{ padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">{title_icon} {title}</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">{subtitle}</p>
        </div>
        <div class="body">
          {content_html}
          <div style="text-align: center; margin-top: 24px;">
            <a href="{action_url}" class="btn">{action_text}</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">HireAI Platform • Intelligent AI Recruitment &amp; Talent Automation</p>
        </div>
      </div>
    </body>
    </html>
    """


def _invitation_email_html(candidate_name: str, job_title: str, company_name: str, match_score: float, location: str, salary: str | None) -> str:
    content = f"""
      <p>Hi <strong>{candidate_name}</strong>,</p>
      <p>Great news! Your profile was evaluated by our AI matching engine and you have been shortlisted for an exciting opportunity:</p>
      
      <div style="background: #f8fafc; border-left: 4px solid #0a66c2; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px; color: #0f172a; font-size: 18px;">{job_title}</h3>
        <p style="margin: 4px 0; color: #475569;"><strong>Company:</strong> {company_name}</p>
        <p style="margin: 4px 0; color: #475569;"><strong>Location:</strong> {location}</p>
        {f'<p style="margin: 4px 0; color: #16a34a;"><strong>Salary:</strong> {salary}</p>' if salary else ''}
        <div style="margin-top: 12px; font-size: 18px; color: #0a66c2; font-weight: 800;">
          🎯 AI Match Score: {match_score}%
        </div>
      </div>
      
      <p>Please log in to your HireAI candidate portal to <strong>Accept</strong> or <strong>Decline</strong> this invitation.</p>
    """
    return _base_email_wrapper("🎯", "You've Been Shortlisted!", "HireAI Talent Opportunity", content, "View Job Invitation", f"{FRONTEND_URL}/candidate/job-invitations")


def _interview_scheduled_email_html(candidate_name: str, job_title: str, company_name: str, date: str, time: str, meet_link: str, message: str) -> str:
    content = f"""
      <p>Hi <strong>{candidate_name}</strong>,</p>
      <p>Your interview for the position of <strong>{job_title}</strong> with <strong>{company_name}</strong> has been officially confirmed!</p>
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 16px;">📅 Confirmed Interview Schedule</h3>
        <p style="margin: 4px 0;"><strong>Date:</strong> {date}</p>
        <p style="margin: 4px 0;"><strong>Time:</strong> {time}</p>
        <p style="margin: 4px 0;"><strong>Location / Meeting Link:</strong> <a href="{meet_link}" style="color: #2563eb; font-weight: bold;">{meet_link}</a></p>
        {f'<p style="margin: 12px 0 0; font-style: italic; color: #475569; border-top: 1px solid #dbeafe; pt-2;">"{message}"</p>' if message else ''}
      </div>

      <p>Tip: You can take an <strong>AI Mock Interview</strong> in your portal before the live meeting to practice tailored questions!</p>
    """
    return _base_email_wrapper("📅", "Interview Confirmed!", f"{job_title} at {company_name}", content, "Join Meeting / View Portal", meet_link if meet_link.startswith("http") else f"{FRONTEND_URL}/candidate/job-invitations")


def _candidate_accepted_alert_email_html(recruiter_name: str, candidate_name: str, candidate_email: str, job_title: str, match_score: float) -> str:
    content = f"""
      <p>Hi <strong>{recruiter_name}</strong>,</p>
      <p>Candidate <strong>{candidate_name}</strong> has just accepted your invitation for <strong>{job_title}</strong>!</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Candidate:</strong> {candidate_name} ({candidate_email})</p>
        <p style="margin: 4px 0;"><strong>Job Role:</strong> {job_title}</p>
        <p style="margin: 4px 0; color: #16a34a; font-weight: bold;"><strong>AI Match Score:</strong> {match_score}%</p>
      </div>

      <p>The candidate is ready in your pipeline. Click below to schedule the interview slot or view their full profile.</p>
    """
    return _base_email_wrapper("🎉", "Candidate Accepted Invitation!", "New Interview Ready in Pipeline", content, "Schedule Interview Slot", f"{FRONTEND_URL}/recruiter/pipeline")


# ─────────────────────────────────────────────────────────────────────────────
#  Core Dispatchers
# ─────────────────────────────────────────────────────────────────────────────

def send_invitation_to_candidates(db: Session, job_id: int, top_n: int = 10):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return 0

    recruiter_profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == job.recruiter_id).first()
    company_name = recruiter_profile.company_name if recruiter_profile else "Company"

    matches = db.query(MatchResult).filter(
        MatchResult.job_id == job_id,
        MatchResult.match_score >= 75.0
    ).order_by(MatchResult.match_score.desc()).limit(top_n).all()

    invited_count = 0
    for match in matches:
        existing = db.query(CandidateInvitation).filter(
            CandidateInvitation.job_id == job_id,
            CandidateInvitation.candidate_id == match.candidate_id
        ).first()

        if not existing:
            invitation = CandidateInvitation(
                job_id=job_id,
                candidate_id=match.candidate_id,
                match_score=match.match_score,
                status="pending"
            )
            db.add(invitation)

            notif = Notification(
                user_id=match.candidate_id,
                title=f"New Job Invitation: {job.title} at {company_name}",
                message=f"You have been shortlisted with a {match.match_score}% match score! Review and accept your invite.",
                type="invitation"
            )
            db.add(notif)
            invited_count += 1

            candidate_user = db.query(User).filter(User.id == match.candidate_id).first()
            if candidate_user:
                html = _invitation_email_html(
                    candidate_name=candidate_user.full_name,
                    job_title=job.title,
                    company_name=company_name,
                    match_score=match.match_score,
                    location=job.location,
                    salary=job.salary
                )
                send_email_async(
                    to_email=candidate_user.email,
                    subject=f"🎯 Shortlisted: {job.title} at {company_name} (Match: {match.match_score}%)",
                    html_body=html
                )

    db.commit()
    return invited_count


def trigger_interview_scheduled_notification(db: Session, invitation_id: int):
    """Sends immediate confirmation email with meeting link to both Candidate and Recruiter."""
    invitation = db.query(CandidateInvitation).filter(CandidateInvitation.id == invitation_id).first()
    if not invitation:
        return

    job = db.query(Job).filter(Job.id == invitation.job_id).first()
    candidate = db.query(User).filter(User.id == invitation.candidate_id).first()
    recruiter = db.query(User).filter(User.id == job.recruiter_id).first() if job else None
    rec_profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == recruiter.id).first() if recruiter else None

    company_name = rec_profile.company_name if rec_profile else "HireAI Partner"
    details = json.loads(invitation.interview_details_json) if invitation.interview_details_json else {}

    date = details.get("date", "Upcoming")
    time = details.get("time", "TBD")
    meet_link = details.get("location_or_link", FRONTEND_URL)
    message = details.get("message", "")

    # Send to Candidate
    if candidate:
        cand_html = _interview_scheduled_email_html(
            candidate_name=candidate.full_name,
            job_title=job.title if job else "Software Engineer",
            company_name=company_name,
            date=date,
            time=time,
            meet_link=meet_link,
            message=message
        )
        send_email_async(
            to_email=candidate.email,
            subject=f"📅 Confirmed Interview: {job.title if job else 'Position'} with {company_name}",
            html_body=cand_html
        )

    # Send to Recruiter
    if recruiter:
        rec_html = _interview_scheduled_email_html(
            candidate_name=recruiter.full_name,
            job_title=f"Candidate: {candidate.full_name if candidate else 'Applicant'}",
            company_name=company_name,
            date=date,
            time=time,
            meet_link=meet_link,
            message=f"Interview with candidate {candidate.full_name} ({candidate.email})."
        )
        send_email_async(
            to_email=recruiter.email,
            subject=f"📅 Interview Scheduled with {candidate.full_name if candidate else 'Candidate'} for {job.title if job else 'Role'}",
            html_body=rec_html
        )


def trigger_candidate_accepted_notification(db: Session, invitation_id: int):
    """Alerts the recruiter via email that candidate has accepted the invitation."""
    invitation = db.query(CandidateInvitation).filter(CandidateInvitation.id == invitation_id).first()
    if not invitation:
        return

    job = db.query(Job).filter(Job.id == invitation.job_id).first()
    candidate = db.query(User).filter(User.id == invitation.candidate_id).first()
    recruiter = db.query(User).filter(User.id == job.recruiter_id).first() if job else None

    if recruiter and candidate and job:
        html = _candidate_accepted_alert_email_html(
            recruiter_name=recruiter.full_name,
            candidate_name=candidate.full_name,
            candidate_email=candidate.email,
            job_title=job.title,
            match_score=invitation.match_score
        )
        send_email_async(
            to_email=recruiter.email,
            subject=f"🎉 Candidate Accepted: {candidate.full_name} for {job.title}",
            html_body=html
        )


def _cascade_email_html(candidate_name: str, job_title: str, company_name: str, match_score: float) -> str:
    content = f"""
      <p>Hi <strong>{candidate_name}</strong>,</p>
      <p>A new position has just opened up and your skills are an exceptional match!</p>
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px; color: #0f172a; font-size: 18px;">{job_title}</h3>
        <p style="margin: 4px 0; color: #475569;"><strong>Company:</strong> {company_name}</p>
        <div style="margin-top: 12px; font-size: 18px; color: #16a34a; font-weight: 800;">
          🚀 AI Match Score: {match_score}%
        </div>
      </div>
      
      <p>Log in to your candidate portal to accept or respond to this exclusive opportunity.</p>
    """
    return _base_email_wrapper("🚀", "New Opportunity Awaits!", f"{job_title} at {company_name}", content, "View Opportunity", f"{FRONTEND_URL}/candidate/job-invitations")


def trigger_cascade_invitation(db: Session, job_id: int, rejected_candidate_id: int):
    """
    When a candidate rejects, find the next-best uncontacted candidate (>=75%)
    and auto-invite them with a cascade notification and email.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return None

    recruiter_profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == job.recruiter_id
    ).first()
    company_name = recruiter_profile.company_name if recruiter_profile else "Company"

    # All already-invited candidate IDs
    invited_ids = [
        row.candidate_id for row in db.query(CandidateInvitation.candidate_id).filter(
            CandidateInvitation.job_id == job_id
        ).all()
    ]

    next_match = db.query(MatchResult).filter(
        MatchResult.job_id == job_id,
        MatchResult.match_score >= 75.0,
        MatchResult.candidate_id.notin_(invited_ids)
    ).order_by(MatchResult.match_score.desc()).first()

    if next_match:
        new_invitation = CandidateInvitation(
            job_id=job_id,
            candidate_id=next_match.candidate_id,
            match_score=next_match.match_score,
            status="pending"
        )
        db.add(new_invitation)

        # In-app notification for new candidate
        notif = Notification(
            user_id=next_match.candidate_id,
            title=f"Job Invitation: {job.title} at {company_name}",
            message=(
                f"You match {next_match.match_score}% with this position! "
                f"Accept or reject to confirm your interest."
            ),
            type="invitation"
        )
        db.add(notif)

        # Notify recruiter about auto-cascade
        candidate_user = db.query(User).filter(User.id == next_match.candidate_id).first()
        cand_name = candidate_user.full_name if candidate_user else "Candidate"
        rec_notif = Notification(
            user_id=job.recruiter_id,
            title=f"Shortlist Cascade Activated — {job.title}",
            message=(
                f"A candidate rejected the offer. System automatically invited next best match: "
                f"{cand_name} ({next_match.match_score}% Match)."
            ),
            type="info"
        )
        db.add(rec_notif)

        db.commit()

        # Cascade email to new candidate
        if candidate_user:
            html = _cascade_email_html(
                candidate_name=candidate_user.full_name,
                job_title=job.title,
                company_name=company_name,
                match_score=next_match.match_score
            )
            send_email_async(
                to_email=candidate_user.email,
                subject=f"🚀 New Job Opportunity: {job.title} at {company_name}",
                html_body=html
            )

        return new_invitation
    return None

