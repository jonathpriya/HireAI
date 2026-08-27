import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import User, CreditTransaction, Notification
from app.security import get_current_user

router = APIRouter(prefix="/api/credits", tags=["Credits & Referral System"])

class CreditTransactionOut(BaseModel):
    id: int
    amount: int
    balance_after: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReferralClaimPayload(BaseModel):
    referral_code: str

@router.get("/balance")
def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return user's current credit balance, unique referral code, and referral statistics."""
    if not current_user.referral_code:
        current_user.referral_code = f"REF-{uuid.uuid4().hex[:6].upper()}"
        db.commit()

    referral_count = db.query(User).filter(User.referred_by == current_user.referral_code).count()

    return {
        "user_id": current_user.id,
        "credits": current_user.credits or 0,
        "referral_code": current_user.referral_code,
        "referred_by": current_user.referred_by,
        "referral_count": referral_count
    }

@router.get("/history", response_model=List[CreditTransactionOut])
def get_credit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return full audit log of all credit earned and spent transactions for current user."""
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    ).order_by(CreditTransaction.created_at.desc()).limit(100).all()
    return transactions

@router.post("/claim")
def claim_referral_code(
    payload: ReferralClaimPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Claim a friend's referral code to receive +5 bonus credits (+10 for inviter)."""
    ref_code = payload.referral_code.strip().upper()
    if not ref_code:
        raise HTTPException(status_code=400, detail="Referral code is required.")
    
    if current_user.referred_by:
        raise HTTPException(status_code=400, detail="You have already claimed a referral code.")

    referrer = db.query(User).filter(User.referral_code.ilike(ref_code)).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code. Please check and try again.")

    if referrer.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot claim your own referral code.")

    # Grant referee +5 credits
    current_user.referred_by = referrer.referral_code
    current_user.credits = (current_user.credits or 0) + 5
    db.add(CreditTransaction(
        user_id=current_user.id,
        amount=5,
        balance_after=current_user.credits,
        reason="referral_code_claimed"
    ))

    # Grant referrer +10 credits
    referrer.credits = (referrer.credits or 0) + 10
    db.add(CreditTransaction(
        user_id=referrer.id,
        amount=10,
        balance_after=referrer.credits,
        reason="referral_reward"
    ))

    db.add(Notification(
        user_id=referrer.id,
        title="🎉 Referral Reward!",
        message=f"{current_user.full_name} claimed your referral code! You received +10 credits.",
        type="info"
    ))

    db.commit()

    return {
        "message": "Referral code applied successfully! You received +5 bonus credits.",
        "new_credits": current_user.credits,
        "referred_by": current_user.referred_by
    }
