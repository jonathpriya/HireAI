# 🚀 HireAI — AI Recruitment & Talent Matching Platform

HireAI is an enterprise-grade, automated AI recruitment platform connecting top talent with corporate recruiters. It features intelligent candidate-job matching, automated multi-channel syndication, PWA mobile support with native device push notifications, and a transparent credit & referral economy.

---

## 🌟 Key Features

### 1. 🤖 AI Matching & Sourcing Engine
- **TF-IDF & Cosine Similarity Scoring**: Automatically scores candidate resumes against job descriptions based on required and preferred skills, domain experience, and education.
- **Multi-Channel Candidate Ingestion**: Sources candidates across **LinkedIn**, **Naukri**, **Foundit (Monster)**, and **HireAI Talent Pool**.
- **Visual Kanban Pipeline**: Drag-and-drop recruiter ATS board across stages: *Interested*, *Shortlisted*, *Client Submission*, *Client Approved*, *Interview Scheduled*, *Interview Selected*, *Offer Extended*, *Onboarding*.
- **1-Click WhatsApp & InMail Connect**: Instantly chat with shortlisted talent or dispatch AI-generated outreach templates.

### 2. 📱 Progressive Web App (PWA) & Mobile Experience
- **Full PWA Compliance**: Installable on Android, iOS, Windows, and macOS directly from the browser with home screen icons and splash screens.
- **Mobile App Navigation**: Sticky bottom navigation bar for candidates and recruiters on smartphone viewports.
- **7-Day Inactivity Native Device Push Notification**:
  - Automatically notifies inactive candidates on their device (Phone or Laptop OS).
  - Displays interactive buttons right in the notification banner:
    - `[🟢 Yes, Still Searching]` — instantly confirms search status.
    - `[🔴 No, Placed / Pause]` — pauses job matching and marks profile as inactive.

### 3. 🪙 Transparent Credit Points & Referral Rules
- **Candidate Registration**: **+10 Credits** upon signup.
- **Recruiter Registration**: **+30 Credits** upon corporate verification.
- **Resume & Contact Unlock**: **-2 Credits** per candidate unlock (requires >= 2 balance; subsequent views free).
- **Referral Rewards**:
  - If someone joins as a **Recruiter** via your referral link: Referrer earns **+10 Credits**.
  - If someone joins as a **Candidate** via your referral link: Referrer earns **+5 Credits**.
  - The invited user receives standard registration points (Candidate: 10, Recruiter: 30) with no arbitrary bonus inflation.
- **Real-Time Transaction Ledger**: Full audit history modal tracking all credit balance changes with timestamps and reasons.

### 4. 📢 Global Job Syndication & Feeds
- **Google for Jobs Schema.org JSON-LD**: Automatic structured schema at `/api/jobs/feed.json`.
- **Indeed / Aggregator XML Feed**: Standards-compliant job feed at `/api/jobs/feed.xml`.

---

## 👥 Verified Test Accounts (Active in Database)

| Role | Email | Password | Starting Credits |
| :--- | :--- | :--- | :--- |
| **Recruiter 1** | `hr@techcorp.com` | `Recruiter@123` | **103 Credits** |
| **Recruiter 2** | `hr@datasolutions.com` | `Recruiter@123` | **100 Credits** |
| **Candidate 1** | `candidate01@gmail.com` | `Candidate@123` | **29 Credits** |
| **Candidate 2** | `candidate02@gmail.com` | `Candidate@123` | **25 Credits** |
| **Platform Admin** | `admin@mycompany.com` | `Admin@123` | Unlimited Access |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Service Worker API (PWA).
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Uvicorn, APScheduler.
- **Database**: SQLite (local development & persistent volumes) / PostgreSQL (Supabase, Neon, AWS RDS, Render Postgres).
- **Authentication**: Stateless JWT tokens (HS256) with bcrypt password hashing.

---

## 🚀 Deployment & Hosting Guide

### Option A: Render (Backend) + Vercel (Frontend) — Recommended

#### 1. Backend on Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository: `https://github.com/jonathpriya/HireAI`.
3. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
4. Set Environment Variables:
   - `SECRET_KEY`: `super-secret-hireai-commercial-key-2026`
   - `DATABASE_URL`: `sqlite:///./hireai.db` *(or your PostgreSQL URL)*
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `ADMIN_EMAIL_DOMAIN`: `mycompany.com`
   - `STORAGE_PROVIDER`: `local` *(or `cloudinary`)*

#### 2. Frontend on Vercel:
1. Create a new project on [Vercel](https://vercel.com) and import the same repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`

---

### Option B: Docker Container Deployment
Run the backend with Docker:
```bash
cd backend
docker build -t hireai-backend .
docker run -p 8000:8000 -e DATABASE_URL="sqlite:///./hireai.db" hireai-backend
```

---

## 💻 Local Development Setup

### 1. Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
