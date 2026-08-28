from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from app.config import UPLOAD_DIR
from app.database import engine, Base
from app.routers import auth, recruiter, candidate, jobs, dashboard, credits, messages
from app.routers.admin import router as admin_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Recruitment Automation Platform API",
    description="Automated AI resume matching, recruiter candidate shortlisting, and candidate engagement cascade engine.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads Directory for Resume & JD downloads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(recruiter.router)
app.include_router(candidate.router)
app.include_router(messages.router)
app.include_router(jobs.router)
app.include_router(dashboard.router)
app.include_router(credits.router)
app.include_router(admin_router)


# ---------- Scheduler Integration ----------
@app.on_event("startup")
def on_startup():
    try:
        from app.tasks import init_scheduler
        init_scheduler()
    except Exception as e:
        print("Scheduler init info:", e)

    # Guarantee default admin user exists in DB
    try:
        from app.database import SessionLocal
        from app.models import User
        from app.security import get_password_hash
        db = SessionLocal()
        admin_email = os.getenv("ADMIN_EMAIL", "admin@mycompany.com").strip().lower()
        admin = db.query(User).filter(User.email.ilike(admin_email)).first()
        if not admin:
            admin = User(
                email=admin_email,
                password_hash=get_password_hash("Admin@123"),
                role="admin",
                is_admin=True,
                full_name="Platform Admin",
                mobile="9999999999"
            )
            db.add(admin)
            db.commit()
            print(f"[Startup] Created default admin: {admin_email} / Admin@123")
        db.close()
    except Exception as e:
        print(f"[Startup] Error seeding default admin: {e}")

@app.on_event("shutdown")
def on_shutdown():
    from app.tasks import scheduler
    scheduler.shutdown()


@app.get("/")
def root():
    return {
        "message": "AI Recruitment Automation Platform API is running",
        "docs_url": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
