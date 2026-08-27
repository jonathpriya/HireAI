from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # "recruiter" or "candidate"
    mobile: Optional[str] = None
    company_name: Optional[str] = None  # for recruiters
    website: Optional[str] = None
    referral_code: Optional[str] = None  # optional referral code of inviter

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str
    credits: int = 0
    referral_code: Optional[str] = None
    profile_pic_url: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    mobile: Optional[str] = None
    profile_pic_url: Optional[str] = None
    created_at: datetime
    credits: int = 0
    referral_code: Optional[str] = None
    referred_by: Optional[str] = None
    is_admin: bool = False


    class Config:
        from_attributes = True


# --- Profile Schemas ---
class RecruiterProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: str
    recruiter_name: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    auto_schedule_interviews: bool = False
    preferred_interview_time: Optional[str] = "10:00 AM"

    class Config:
        from_attributes = True


class CandidateProfileUpdate(BaseModel):
    education: Optional[str] = None
    experience_years: Optional[float] = 0.0
    skills: Optional[List[str]] = []
    certifications: Optional[str] = None
    projects: Optional[str] = None
    current_company: Optional[str] = None
    expected_salary: Optional[str] = None
    preferred_location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_open_to_work: Optional[bool] = True
    profile_pic_url: Optional[str] = None

class CandidateProfileOut(BaseModel):
    id: int
    user_id: int
    education: Optional[str] = None
    experience_years: float = 0.0
    skills: List[str] = []
    certifications: Optional[str] = None
    projects: Optional[str] = None
    current_company: Optional[str] = None
    expected_salary: Optional[str] = None
    preferred_location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    completion_pct: int = 20
    is_open_to_work: bool = True
    profile_pic_url: Optional[str] = None
    communication_score: Optional[float] = None
    communication_assessment_json: Optional[str] = None

    class Config:

        from_attributes = True

# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
    experience_required: float = 0.0
    qualification: Optional[str] = None
    salary: Optional[str] = None
    employment_type: Optional[str] = "Full-Time"
    location: str

class JobOut(BaseModel):
    id: int
    recruiter_id: int
    title: str
    description: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_required: float
    qualification: Optional[str] = None
    salary: Optional[str] = None
    employment_type: str
    location: str
    status: str
    jd_file_path: Optional[str] = None
    created_at: datetime
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Match & Invitation Schemas ---
class CandidateShortlistOut(BaseModel):
    invitation_id: int
    candidate_id: int
    candidate_name: str
    email: str
    mobile: Optional[str] = None
    match_score: float
    status: str
    experience_years: float
    skills: List[str]
    matching_skills: List[str]
    skill_gap: List[str]
    education: Optional[str] = None
    current_company: Optional[str] = None
    profile_pic_url: Optional[str] = None
    job_id: Optional[int] = None
    job_title: Optional[str] = None
    resume_id: Optional[int] = None
    resume_file_path: Optional[str] = None
    responded_at: Optional[datetime] = None
    communication_score: Optional[float] = None



class InvitationRespond(BaseModel):
    action: str  # "accept" or "reject"

class InterviewInviteCreate(BaseModel):
    invitation_id: int
    interview_date: str
    interview_time: str
    location_or_link: str
    message: Optional[str] = None

class InvitationOut(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    job_description: str
    experience_required: float
    salary: Optional[str] = None
    location: str
    match_score: float
    status: str
    sent_at: datetime
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    location_or_link: Optional[str] = None
    interview_message: Optional[str] = None


# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
# --- Review Schemas ---
class ReviewCreate(BaseModel):
    reviewer_id: int
    target_user_id: int
    rating: int  # 1-5
    comment: Optional[str] = None
    role: str  # "candidate" or "recruiter"

class ReviewOut(BaseModel):
    id: int
    reviewer_id: int
    target_user_id: int
    rating: int
    comment: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

