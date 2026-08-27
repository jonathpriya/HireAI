from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RecruiterProfile, CandidateProfile
from app.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    role = user_data.role.lower()
    if role not in ["recruiter", "candidate", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role. Must be 'recruiter', 'candidate', or 'admin'")

    clean_email = (user_data.email or "").strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    # ── Strict Corporate Work Email & Domain Validation for Recruiters ──────────
    if role == "recruiter":
        company_name = (user_data.company_name or "").strip()
        website = (user_data.website or "").strip()

        if not company_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Company name is required for recruiter registration."
            )

        if not website:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Official company website is required for corporate recruiter verification."
            )

        # 1. Block generic / personal email providers
        PUBLIC_EMAIL_DOMAINS = {
            "gmail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "outlook.com", 
            "hotmail.com", "live.com", "icloud.com", "mail.com", "aol.com", 
            "protonmail.com", "zoho.com", "rediffmail.com", "gmx.com", "yandex.com"
        }

        email_parts = clean_email.split("@")
        if len(email_parts) != 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format.")

        email_domain = email_parts[1].lower().strip()

        if email_domain in PUBLIC_EMAIL_DOMAINS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Personal email provider (@{email_domain}) is not permitted. Corporate recruiters must sign up with an official company work email."
            )

        # 2. Extract base domain from website
        raw_web = website.lower()
        if not raw_web.startswith("http://") and not raw_web.startswith("https://"):
            raw_web = "https://" + raw_web
        
        from urllib.parse import urlparse
        parsed = urlparse(raw_web)
        web_host = (parsed.netloc or parsed.path).split(":")[0].replace("www.", "").strip().lower()

        # Handle subdomains or exact matches (e.g. email @techcorp.com vs website techcorp.com or careers.techcorp.com)
        is_domain_match = (
            email_domain == web_host or 
            web_host.endswith("." + email_domain) or 
            email_domain.endswith("." + web_host) or
            email_domain.split(".")[0] == web_host.split(".")[0]
        )

        if not is_domain_match:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email domain (@{email_domain}) does not match your company website domain (@{web_host}). Please use your official corporate work email."
            )


    import uuid
    from app.models import CreditTransaction, Notification

    # Generate unique referral code (e.g., REF-8A1F)
    ref_code = f"REF-{uuid.uuid4().hex[:6].upper()}"

    initial_credits = 10 if role == "candidate" else (30 if role == "recruiter" else 0)

    new_user = User(
        email=clean_email,
        password_hash=get_password_hash(user_data.password),
        role=role,
        is_admin=(role == "admin"),
        full_name=user_data.full_name,
        mobile=user_data.mobile,
        credits=initial_credits,
        referral_code=ref_code
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initial registration credit transaction
    db.add(CreditTransaction(
        user_id=new_user.id,
        amount=initial_credits,
        balance_after=new_user.credits,
        reason="registration_bonus"
    ))

    # Process signup referral code if provided
    if user_data.referral_code:
        input_ref = user_data.referral_code.strip().upper()
        referrer = db.query(User).filter(User.referral_code.ilike(input_ref)).first()
        if referrer and referrer.id != new_user.id:
            new_user.referred_by = referrer.referral_code

            # Referral Bonus Rules:
            # - If new user registers as a Recruiter -> Referrer gets +20 credits
            # - If new user registers as a Candidate -> Referrer gets +10 credits
            ref_bonus = 20 if role == "recruiter" else 10

            referrer.credits = (referrer.credits or 0) + ref_bonus
            db.add(CreditTransaction(
                user_id=referrer.id,
                amount=ref_bonus,
                balance_after=referrer.credits,
                reason="referral_reward"
            ))
            db.add(Notification(
                user_id=referrer.id,
                title="🎉 Referral Bonus Earned!",
                message=f"You earned +{ref_bonus} bonus credits because {new_user.full_name} registered as a {role.capitalize()} using your referral code!",
                type="credit"
            ))



    if role == "recruiter":
        profile = RecruiterProfile(
            user_id=new_user.id,
            company_name=user_data.company_name or f"{new_user.full_name}'s Company",
            recruiter_name=new_user.full_name,
            website=user_data.website
        )
        db.add(profile)
    else:
        profile = CandidateProfile(
            user_id=new_user.id,
            completion_pct=20
        )
        db.add(profile)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "user_id": new_user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        credits=new_user.credits,
        referral_code=new_user.referral_code,
        profile_pic_url=new_user.profile_pic_url
    )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    import uuid
    clean_email = (credentials.email or "").strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Generate referral code for existing users if missing
    if not user.referral_code:
        user.referral_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
        db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        credits=user.credits or 0,
        referral_code=user.referral_code,
        profile_pic_url=user.profile_pic_url
    )



@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
