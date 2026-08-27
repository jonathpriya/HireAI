import os
import uuid
import logging
from pathlib import Path
from typing import Tuple, Optional
from app.config import (
    UPLOAD_DIR, RESUME_UPLOAD_DIR, JD_UPLOAD_DIR, PROFILE_PIC_UPLOAD_DIR,
    STORAGE_PROVIDER, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME, AWS_REGION, AWS_ENDPOINT_URL, CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
)

logger = logging.getLogger(__name__)

# Configure Cloudinary if credentials provided
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )
        logger.info("Cloudinary storage provider initialized.")
    except Exception as e:
        logger.warning(f"Failed to initialize Cloudinary: {e}")


def get_s3_client():
    """Returns an initialized S3 client for AWS S3, Cloudflare R2, or Supabase Storage."""
    if not (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_BUCKET_NAME):
        return None
    try:
        import boto3
        from botocore.config import Config
        s3_config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"}
        )
        kwargs = {
            "service_name": "s3",
            "aws_access_key_id": AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": AWS_SECRET_ACCESS_KEY,
            "region_name": AWS_REGION or "us-east-1",
            "config": s3_config
        }
        if AWS_ENDPOINT_URL:
            kwargs["endpoint_url"] = AWS_ENDPOINT_URL
        return boto3.client(**kwargs)
    except Exception as e:
        logger.error(f"Failed to initialize S3 client: {e}")
        return None


async def save_uploaded_file(
    file_bytes: bytes,
    original_filename: str,
    folder: str = "resumes"  # "resumes", "jds", "profile_pics"
) -> Tuple[str, str]:
    """
    Saves file to the configured storage provider (S3 / Cloudflare R2 / Cloudinary / Local).
    Returns (public_url_or_relative_path, local_save_path_or_identifier).
    """
    ext = Path(original_filename).suffix.lower()
    unique_name = f"{folder}_{uuid.uuid4().hex[:12]}{ext}"

    # 1. AWS S3 / Cloudflare R2 / Supabase Storage
    if STORAGE_PROVIDER in ["s3", "r2", "supabase"]:
        s3 = get_s3_client()
        if s3:
            s3_key = f"{folder}/{unique_name}"
            content_type = "application/pdf" if ext == ".pdf" else "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "application/octet-stream"
            s3.put_object(
                Bucket=AWS_BUCKET_NAME,
                Key=s3_key,
                Body=file_bytes,
                ContentType=content_type
            )
            # If custom CDN endpoint configured or standard S3 URL
            if AWS_ENDPOINT_URL:
                public_url = f"{AWS_ENDPOINT_URL}/{AWS_BUCKET_NAME}/{s3_key}"
            else:
                public_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION or 'us-east-1'}.amazonaws.com/{s3_key}"
            
            # Also save a local cache copy for instant NLP parsing if resume or JD
            local_dir = RESUME_UPLOAD_DIR if folder == "resumes" else JD_UPLOAD_DIR if folder == "jds" else PROFILE_PIC_UPLOAD_DIR
            local_path = local_dir / unique_name
            with open(local_path, "wb") as f:
                f.write(file_bytes)

            logger.info(f"File uploaded to S3: {public_url}")
            return public_url, str(local_path)

    # 2. Cloudinary (Direct CDN for Images and PDFs)
    if STORAGE_PROVIDER == "cloudinary" and CLOUDINARY_CLOUD_NAME:
        try:
            import cloudinary.uploader
            res = cloudinary.uploader.upload(
                file_bytes,
                public_id=f"hireai/{folder}/{unique_name}",
                resource_type="auto"
            )
            public_url = res.get("secure_url") or res.get("url")
            
            # Save local cache for NLP parser
            local_dir = RESUME_UPLOAD_DIR if folder == "resumes" else JD_UPLOAD_DIR if folder == "jds" else PROFILE_PIC_UPLOAD_DIR
            local_path = local_dir / unique_name
            with open(local_path, "wb") as f:
                f.write(file_bytes)

            logger.info(f"File uploaded to Cloudinary: {public_url}")
            return public_url, str(local_path)
        except Exception as e:
            logger.warning(f"Cloudinary upload failed, falling back to local: {e}")

    # 3. Local Storage (Default Development & Resilient Fallback)
    target_dir = RESUME_UPLOAD_DIR if folder == "resumes" else JD_UPLOAD_DIR if folder == "jds" else PROFILE_PIC_UPLOAD_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    local_path = target_dir / unique_name
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    relative_url = f"/uploads/{folder}/{unique_name}"
    return relative_url, str(local_path)
