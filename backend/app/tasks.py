import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import CandidateProfile, CreditTransaction, User

# Configure logger
logger = logging.getLogger(__name__)

# Scheduler instance (singleton)
scheduler = AsyncIOScheduler()

def disable_inactive_candidates():
    """Disable 'Open to Work' for candidates inactive for >30 days.
    This function runs as a scheduled job.
    """
    db: Session = SessionLocal()
    try:
        threshold_date = datetime.utcnow() - timedelta(days=30)
        candidates = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.is_open_to_work == True)
            .filter(CandidateProfile.last_active_at < threshold_date)
            .all()
        )
        for cand in candidates:
            cand.is_open_to_work = False
            # Record audit transaction (no credit change)
            tx = CreditTransaction(
                user_id=cand.user_id,
                amount=0,
                balance_after=cand.user.credits,
                reason="auto_disable_open_to_work",
            )
            db.add(tx)
            logger.info(
                f"Disabled Open to Work for candidate_id={cand.id} (user_id={cand.user_id})"
            )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception(f"Error in disable_inactive_candidates: {e}")
    finally:
        db.close()

def init_scheduler():
    """Initialize and start the APScheduler.
    Call this on FastAPI startup.
    """
    scheduler.add_job(
        disable_inactive_candidates,
        trigger="interval",
        days=1,
        next_run_time=datetime.utcnow(),
        id="disable_inactive_candidates",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started with job: disable_inactive_candidates")
