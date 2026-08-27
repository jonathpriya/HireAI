from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "recruiter", "candidate", or "admin"
    is_admin = Column(Boolean, default=False)
    full_name = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    profile_pic_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


    # Credit System
    credits = Column(Integer, default=0)

    # Referral System
    referral_code = Column(String, unique=True, nullable=True)
    referred_by = Column(String, nullable=True)  # referral code of referrer

    # Relationships
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    posted_jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    credit_transactions = relationship("CreditTransaction", back_populates="user", cascade="all, delete-orphan")

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    company_name = Column(String, nullable=False)
    recruiter_name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    auto_schedule_interviews = Column(Boolean, default=False)
    preferred_interview_time = Column(String, default="10:00 AM")

    user = relationship("User", back_populates="recruiter_profile")


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    education = Column(String, nullable=True)
    experience_years = Column(Float, default=0.0)
    skills_json = Column(Text, default="[]")  # JSON string array
    certifications = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    current_company = Column(String, nullable=True)
    expected_salary = Column(String, nullable=True)
    preferred_location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    completion_pct = Column(Integer, default=20)

    # Open to Work & Profile Pic
    is_open_to_work = Column(Boolean, default=True)
    profile_pic_url = Column(String, nullable=True)
    source_platform = Column(String, default="hireai") # hireai, naukri, linkedin, monster, referral, google_jobs
    external_profile_url = Column(String, nullable=True)
    last_active_at = Column(DateTime, default=datetime.utcnow)


    # Communication Assessment Score (0-100)
    communication_score = Column(Float, nullable=True)
    communication_assessment_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="candidate_profile")

class UnlockedResume(Base):
    __tablename__ = "unlocked_resumes"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    extracted_skills_json = Column(Text, default="[]")
    extracted_experience_years = Column(Float, default=0.0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("User", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills_json = Column(Text, default="[]")
    preferred_skills_json = Column(Text, default="[]")
    experience_required = Column(Float, default=0.0)
    qualification = Column(String, nullable=True)
    salary = Column(String, nullable=True)
    employment_type = Column(String, default="Full-Time")
    location = Column(String, nullable=False)
    status = Column(String, default="active")  # active or closed
    jd_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship("User", back_populates="posted_jobs")
    match_results = relationship("MatchResult", back_populates="job", cascade="all, delete-orphan")
    invitations = relationship("CandidateInvitation", back_populates="job", cascade="all, delete-orphan")

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=False)  # 0 to 100
    matching_skills_json = Column(Text, default="[]")
    skill_gap_json = Column(Text, default="[]")
    calculated_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="match_results")
    candidate = relationship("User")

class CandidateInvitation(Base):
    __tablename__ = "candidate_invitations"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, interested, rejected, interview_scheduled
    sent_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    interview_details_json = Column(Text, nullable=True)

    # Unique ID for interview prep access
    prep_token = Column(String, nullable=True, unique=True)

    job = relationship("Job", back_populates="invitations")
    candidate = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, invitation, status_change
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class CreditTransaction(Base):
    """Records every credit earn/deduct event for full audit trail."""
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)       # positive = earned, negative = spent
    balance_after = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)        # e.g. "registration_bonus", "job_post", "job_apply"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credit_transactions")


class CommunicationAssessment(Base):
    """Stores the communication quiz results per candidate."""
    __tablename__ = "communication_assessments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers_json = Column(Text, default="[]")   # JSON list of {question_id, answer}
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    taken_at = Column(DateTime, default=datetime.utcnow)
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    role = Column(String, nullable=False)  # "candidate" or "recruiter"
    created_at = Column(DateTime, default=datetime.utcnow)
    # relationships for convenience
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    target_user = relationship("User", foreign_keys=[target_user_id])



class InterviewPrep(Base):
    """Stores AI-generated interview preparation content for an accepted invitation."""
    __tablename__ = "interview_preps"

    id = Column(Integer, primary_key=True, index=True)
    invitation_id = Column(Integer, ForeignKey("candidate_invitations.id"), nullable=False, unique=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    questions_json = Column(Text, default="[]")   # list of generated Q&A pairs
    tips_json = Column(Text, default="[]")        # preparation tips
    generated_at = Column(DateTime, default=datetime.utcnow)


class JobBoardIntegration(Base):
    """Stores connected employer accounts for multi-channel syndication (Naukri, LinkedIn, Monster, etc.)."""
    __tablename__ = "job_board_integrations"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False) # "naukri", "linkedin", "monster", "indeed", "telegram"
    account_email = Column(String, nullable=True)
    connected_username = Column(String, nullable=True)
    subscription_plan = Column(String, nullable=True) # e.g. "Naukri Super Resdex Enterprise", "LinkedIn Recruiter Corporate Seat"
    api_key_or_token = Column(String, nullable=True)
    client_id = Column(String, nullable=True)
    webhook_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    auto_syndicate_on_post = Column(Boolean, default=True)
    last_sync_candidates_count = Column(Integer, default=0)
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    """1-on-1 Direct InMail / Chat between Recruiters and Candidates with instant AI quick replies."""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class SavedCandidate(Base):
    """Recruiter bookmark / talent pool categorization for top candidates."""
    __tablename__ = "saved_candidates"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pool_name = Column(String, default="General Talent Pool", index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship("User", foreign_keys=[recruiter_id])
    candidate = relationship("User", foreign_keys=[candidate_id])



