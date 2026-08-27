import json
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_candidate_match(
    job_title: str,
    job_description: str,
    required_skills: List[str],
    experience_required: float,
    candidate_skills: List[str],
    candidate_experience: float,
    resume_text: str = ""
) -> Dict[str, Any]:
    """
    Computes a weighted 0-100% match score based on:
    1. Skill Matrix Overlap (50% weight)
    2. Text TF-IDF Cosine Similarity (30% weight)
    3. Experience Match (20% weight)
    """
    # 1. Skill Matrix Overlap
    req_skills_lower = set(s.lower() for s in required_skills)
    cand_skills_lower = set(s.lower() for s in candidate_skills)
    
    # Also check if any required skill appears in resume text
    resume_lower = resume_text.lower() if resume_text else ""
    extended_cand_skills = set(cand_skills_lower)
    for req_s in req_skills_lower:
        if req_s in resume_lower:
            extended_cand_skills.add(req_s)


    if req_skills_lower:
        matching_skills_set = req_skills_lower.intersection(extended_cand_skills)
        skill_score = (len(matching_skills_set) / len(req_skills_lower)) * 100.0
    else:
        skill_score = 80.0  # default baseline if no explicit skills required

    matching_skills = [s for s in required_skills if s.lower() in extended_cand_skills]
    skill_gap = [s for s in required_skills if s.lower() not in extended_cand_skills]

    # 2. TF-IDF Cosine Similarity
    jd_full_text = f"{job_title} {job_description} {' '.join(required_skills)}"
    cand_full_text = f"{' '.join(candidate_skills)} {resume_text}"
    
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([jd_full_text, cand_full_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        text_score = float(sim) * 100.0
    except Exception:
        text_score = skill_score

    # 3. Smooth Experience Match Calculation
    if experience_required <= 0:
        exp_score = 100.0
    elif candidate_experience >= experience_required:
        exp_score = 100.0
    else:
        ratio = candidate_experience / experience_required
        exp_score = max(30.0, min(100.0, ratio * 100.0))

    # Composite Score Calculation
    composite_score = (skill_score * 0.50) + (text_score * 0.30) + (exp_score * 0.20)
    final_score = round(min(100.0, max(15.0, composite_score)), 1)

    return {
        "match_score": final_score,
        "matching_skills": matching_skills,
        "skill_gap": skill_gap,
        "skill_score": round(skill_score, 1),
        "text_score": round(text_score, 1),
        "exp_score": round(exp_score, 1)
    }


def run_ai_matching_for_candidate(db, candidate_user_id: int):
    """
    Runs AI matching for a candidate against ALL active jobs in the system.
    Saves match results, skill gaps, and if match_score >= 75.0, sends automated Job Invitation & Notification.
    """
    from app.models import Job, CandidateProfile, Resume, MatchResult, CandidateInvitation, Notification, RecruiterProfile
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == candidate_user_id).first()
    resume = db.query(Resume).filter(Resume.candidate_id == candidate_user_id).order_by(Resume.uploaded_at.desc()).first()
    
    cand_skills = []
    if profile and profile.skills_json:
        try:
            cand_skills = json.loads(profile.skills_json)
        except Exception:
            cand_skills = []
    if resume and resume.extracted_skills_json:
        try:
            extracted = json.loads(resume.extracted_skills_json)
            cand_skills = list(set(cand_skills + extracted))
        except Exception:
            pass
    
    cand_exp = profile.experience_years if profile else 0.0
    resume_text = resume.raw_text if resume else ""

    active_jobs = db.query(Job).filter(Job.status == "active").all()

    for job in active_jobs:
        req_skills = json.loads(job.required_skills_json) if job.required_skills_json else []
        match_res = calculate_candidate_match(
            job_title=job.title,
            job_description=job.description,
            required_skills=req_skills,
            experience_required=job.experience_required,
            candidate_skills=cand_skills,
            candidate_experience=cand_exp,
            resume_text=resume_text,
        )

        # Save/update MatchResult
        match_obj = db.query(MatchResult).filter(
            MatchResult.job_id == job.id,
            MatchResult.candidate_id == candidate_user_id
        ).first()

        if not match_obj:
            match_obj = MatchResult(
                job_id=job.id,
                candidate_id=candidate_user_id,
                match_score=match_res["match_score"],
                matching_skills_json=json.dumps(match_res["matching_skills"]),
                skill_gap_json=json.dumps(match_res["skill_gap"]),
            )
            db.add(match_obj)
        else:
            match_obj.match_score = match_res["match_score"]
            match_obj.matching_skills_json = json.dumps(match_res["matching_skills"])
            match_obj.skill_gap_json = json.dumps(match_res["skill_gap"])

        # Auto Invite Trigger if >= 75%
        if match_res["match_score"] >= 75.0:
            existing_inv = db.query(CandidateInvitation).filter(
                CandidateInvitation.job_id == job.id,
                CandidateInvitation.candidate_id == candidate_user_id
            ).first()

            if not existing_inv:
                new_inv = CandidateInvitation(
                    job_id=job.id,
                    candidate_id=candidate_user_id,
                    match_score=match_res["match_score"],
                    status="pending",
                )
                db.add(new_inv)

                rec_profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == job.recruiter_id).first()
                company_name = rec_profile.company_name if rec_profile else "Company"

                notif = Notification(
                    user_id=candidate_user_id,
                    title=f"🎉 Automated Job Invitation: {job.title}",
                    message=f"You matched {match_res['match_score']}% for position '{job.title}' at {company_name}! Review and accept your invitation.",
                    type="invitation"
                )
                db.add(notif)

    db.commit()


