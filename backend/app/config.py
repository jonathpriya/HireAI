import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()  # loads .env file if present

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-ai-recruitment-key-2026-antigravity")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ADMIN_EMAIL_DOMAIN = os.getenv("ADMIN_EMAIL_DOMAIN", "mycompany.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ─── Email Delivery Configuration ─────────────────────────────────────
SMTP_SENDER = os.getenv("SMTP_SENDER", "noreply.hireai@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

# ─── Database Configuration ──────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres.yzwwylyutyvwrvmwgell:Dharshini%4025@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
)

# Fix Heroku / Supabase postgres:// -> postgresql+pg8000:// format for Vercel Serverless & SQLAlchemy 2.0
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://") and "+pg8000" not in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

# ─── Cloud & Local Storage Configuration ─────────────────────────────
# Options: "local", "s3", "r2", "supabase", "cloudinary"
STORAGE_PROVIDER = os.getenv("STORAGE_PROVIDER", "local").lower()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL", "")  # For Cloudflare R2 / Supabase S3

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Ensure UPLOAD_DIR is writable (use /tmp on Serverless environments like Vercel)
try:
    UPLOAD_DIR = BASE_DIR / "uploads"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    import tempfile
    UPLOAD_DIR = Path(tempfile.gettempdir()) / "uploads"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

RESUME_UPLOAD_DIR = UPLOAD_DIR / "resumes"
JD_UPLOAD_DIR = UPLOAD_DIR / "jds"
PROFILE_PIC_UPLOAD_DIR = UPLOAD_DIR / "profile_pics"

try:
    RESUME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    JD_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    PROFILE_PIC_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
