import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.models import User, ChatMessage, Notification, RecruiterProfile, CandidateProfile, Job
from app.security import get_current_user
from app.services.notification_service import send_email_async, _base_email_wrapper
from app.config import FRONTEND_URL

router = APIRouter(prefix="/api/messages", tags=["InMail & 1-on-1 Messaging"])


class SendMessageRequest(BaseModel):
    receiver_id: int
    message: str


class AISuggestionsRequest(BaseModel):
    other_user_id: int
    last_message: Optional[str] = None


@router.get("/unread-count")
def get_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns total unread messages count for the navbar badge."""
    count = db.query(ChatMessage).filter(
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).count()
    return {"unread_count": count}


@router.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns list of distinct active chat conversations with:
    - other user details (name, avatar, role, is_open_to_work, company)
    - latest message snippet & timestamp
    - unread messages count
    """
    # Fetch all messages involving current user
    messages = db.query(ChatMessage).filter(
        or_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == current_user.id)
    ).order_by(desc(ChatMessage.created_at)).all()

    seen_user_ids = set()
    conversations = []

    for msg in messages:
        other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if other_id in seen_user_ids:
            continue
        seen_user_ids.add(other_id)

        other_user = db.query(User).filter(User.id == other_id).first()
        if not other_user:
            continue

        # Count unread messages sent by this other user to current_user
        unread = db.query(ChatMessage).filter(
            ChatMessage.sender_id == other_id,
            ChatMessage.receiver_id == current_user.id,
            ChatMessage.is_read == False
        ).count()

        # Extra context (profile pic, open to work, hiring status, title)
        title = ""
        is_open_to_work = False
        is_hiring = False
        profile_pic = other_user.profile_pic_url or ""

        if other_user.role == "candidate":
            cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == other_id).first()
            if cand:
                is_open_to_work = bool(cand.is_open_to_work)
                profile_pic = cand.profile_pic_url or profile_pic
                title = cand.current_company or "Candidate"
        elif other_user.role == "recruiter":
            rec = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == other_id).first()
            if rec:
                title = rec.company_name or "Recruiter"
                # If recruiter has active jobs, mark as is_hiring
                active_jobs = db.query(Job).filter(Job.recruiter_id == other_id, Job.is_active == True).count()
                is_hiring = active_jobs > 0

        conversations.append({
            "other_user_id": other_id,
            "name": other_user.full_name,
            "email": other_user.email,
            "role": other_user.role,
            "title": title,
            "profile_pic_url": profile_pic,
            "is_open_to_work": is_open_to_work,
            "is_hiring": is_hiring,
            "latest_message": msg.message,
            "latest_time": msg.created_at.isoformat(),
            "latest_sender_id": msg.sender_id,
            "unread_count": unread
        })

    return conversations


@router.get("/history/{other_user_id}")
def get_chat_history(other_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns ordered message history between current_user and other_user_id.
    Automatically marks incoming messages as read.
    """
    other_user = db.query(User).filter(User.id == other_user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Mark all unread messages from other_user as read
    db.query(ChatMessage).filter(
        ChatMessage.sender_id == other_user_id,
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(ChatMessage).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == other_user_id),
            and_(ChatMessage.sender_id == other_user_id, ChatMessage.receiver_id == current_user.id)
        )
    ).order_by(ChatMessage.created_at.asc()).all()

    # Context about the other user
    title = ""
    is_open_to_work = False
    is_hiring = False
    profile_pic = other_user.profile_pic_url or ""

    if other_user.role == "candidate":
        cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == other_user_id).first()
        if cand:
            is_open_to_work = bool(cand.is_open_to_work)
            profile_pic = cand.profile_pic_url or profile_pic
            title = cand.current_company or "Candidate"
    elif other_user.role == "recruiter":
        rec = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == other_user_id).first()
        if rec:
            title = rec.company_name or "Recruiter"
            active_jobs = db.query(Job).filter(Job.recruiter_id == other_user_id, Job.is_active == True).count()
            is_hiring = active_jobs > 0

    return {
        "other_user": {
            "id": other_user.id,
            "name": other_user.full_name,
            "email": other_user.email,
            "role": other_user.role,
            "title": title,
            "profile_pic_url": profile_pic,
            "is_open_to_work": is_open_to_work,
            "is_hiring": is_hiring
        },
        "messages": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "receiver_id": m.receiver_id,
                "message": m.message,
                "is_read": m.is_read,
                "created_at": m.created_at.isoformat()
            }
            for m in messages
        ]
    }


@router.post("/send")
def send_chat_message(req: SendMessageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Sends a 1-on-1 chat message, creates an in-app notification, and sends async notification email."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if req.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")

    receiver = db.query(User).filter(User.id == req.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    new_msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=req.receiver_id,
        message=req.message.strip(),
        is_read=False
    )
    db.add(new_msg)

    # In-app notification for recipient
    notif = Notification(
        user_id=req.receiver_id,
        title=f"💬 New Message from {current_user.full_name}",
        message=f"{current_user.full_name}: \"{req.message[:80]}...\"",
        type="message"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_msg)

    # Async Email Alert for offline recipients
    email_content = f"""
      <p>Hi <strong>{receiver.full_name}</strong>,</p>
      <p>You received a new direct message from <strong>{current_user.full_name}</strong> on HireAI:</p>
      
      <div style="background: #f8fafc; border-left: 4px solid #0a66c2; padding: 16px; border-radius: 8px; margin: 18px 0; font-style: italic; color: #1e293b;">
        "{req.message}"
      </div>
      
      <p>Click below to reply instantly using AI smart suggestions.</p>
    """
    html_body = _base_email_wrapper("💬", "New Direct Message", f"Message from {current_user.full_name}", email_content, "Open Chat & Reply", f"{FRONTEND_URL}/messages?user_id={current_user.id}")
    send_email_async(
        to_email=receiver.email,
        subject=f"💬 New Message from {current_user.full_name} on HireAI",
        html_body=html_body
    )

    return {
        "status": "success",
        "message_id": new_msg.id,
        "created_at": new_msg.created_at.isoformat()
    }


@router.post("/ai-smart-replies")
def get_ai_smart_replies(req: AISuggestionsRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Generates 3-4 intelligent, role-aware, 1-click suggested quick replies
    based on conversation context (LinkedIn Smart Reply style).
    """
    other_user = db.query(User).filter(User.id == req.other_user_id).first()
    last_msg = (req.last_message or "").lower()

    suggestions = []

    # If Candidate is replying to Recruiter
    if current_user.role == "candidate":
        if "interview" in last_msg or "schedule" in last_msg or "time" in last_msg:
            suggestions = [
                "I am available this Thursday at 10:00 AM! 📅",
                "Thank you! Could you please share the Google Meet link?",
                "Could we schedule this for next Monday afternoon?"
            ]
        elif "salary" in last_msg or "package" in last_msg:
            suggestions = [
                "My expected salary aligns with industry standards for this role.",
                "I am flexible depending on the overall benefits and growth opportunity.",
                "Could you please share the budgeted salary range for this position?"
            ]
        elif "resume" in last_msg or "portfolio" in last_msg:
            suggestions = [
                "I have attached my latest updated resume in my profile! 📄",
                "Sure, you can review my live portfolio projects on my profile.",
                "I'd be glad to walk you through my recent project highlights."
            ]
        else:
            suggestions = [
                "Thank you for reaching out! I am very interested in this role. 🚀",
                "Could you tell me more about the day-to-day responsibilities?",
                "I would love to connect for a quick 10-minute introductory call."
            ]

    # If Recruiter is replying to Candidate
    else:
        if "available" in last_msg or "yes" in last_msg or "interested" in last_msg:
            suggestions = [
                "Great! I will send over the confirmed Google Meet invite shortly. 📅",
                "Wonderful! Let's schedule a 20-minute technical screening call.",
                "Could you share your updated resume and phone number?"
            ]
        elif "salary" in last_msg or "range" in last_msg:
            suggestions = [
                "Our budget for this role is competitive based on experience.",
                "Let's discuss compensation details during our introductory call.",
                "We offer strong benefits, flexible work, and performance bonuses."
            ]
        else:
            suggestions = [
                "Hi! Your background looks like an excellent fit for our open role. 🎯",
                "Would you be open to a quick call this week to discuss details?",
                "Thank you for your response! Let's connect on a quick interview."
            ]

    return {"suggestions": suggestions}
