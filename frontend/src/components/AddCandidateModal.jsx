import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  UserPlus, X, Briefcase, Mail, Phone, Upload, Sparkles, Check, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';

export default function AddCandidateModal({ onClose, onCandidateAdded, defaultJobId, jobs = [] }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [jobId, setJobId] = useState(defaultJobId || (jobs.length > 0 ? jobs[0].id : ''));
  const [experienceYears, setExperienceYears] = useState(2);
  const [skills, setSkills] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [referralSource, setReferralSource] = useState('Internal Employee Referral');
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (defaultJobId) {
      setJobId(defaultJobId);
    } else if (jobs.length > 0 && !jobId) {
      setJobId(jobs[0].id);
    }
  }, [defaultJobId, jobs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) {
      setError('Please select a job opening for this candidate.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('full_name', fullName.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('job_id', jobId);
    if (mobile) formData.append('mobile', mobile.trim());
    formData.append('experience_years', experienceYears || 0);
    if (skills) formData.append('skills', skills);
    if (currentCompany) formData.append('current_company', currentCompany);
    if (education) formData.append('education', education);
    if (referralSource) formData.append('referral_source', referralSource);
    if (resumeFile) formData.append('file', resumeFile);

    try {
      const res = await API.post('/recruiter/add-candidate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessData(res.data);
      if (onCandidateAdded) {
        onCandidateAdded(res.data);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to add manual candidate", err);
      setError(err.response?.data?.detail || "Failed to add candidate.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-xl w-full max-h-[92vh] rounded-3xl border border-blue-500/40 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Add Candidate / Internal Referral
              </h3>
              <p className="text-xs text-slate-400">
                Manually register candidate &amp; place into hiring pipeline
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {successData ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Candidate Added to Pipeline!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              <strong className="text-white">{successData.candidate_name}</strong> was added to the hiring pipeline with <strong className="text-emerald-400">{successData.match_score}% AI match score</strong>. An invitation email with login credentials has been sent!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Job Opening */}
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Target Job Position *
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
              >
                <option value="">-- Select Job Opening --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department || 'General'} - {j.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Name & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Candidate Email *</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Mobile & Experience */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mobile / Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Total Experience (Years)</label>
                <input
                  type="number"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Primary Skills (Comma Separated)</label>
              <input
                type="text"
                placeholder="Python, React, FastAPI, SQL, Docker..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
              />
            </div>

            {/* Current Company & Referral Source */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Current Company</label>
                <input
                  type="text"
                  placeholder="e.g. Infotech Systems"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Referral Source / Channel</label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                >
                  <option value="Internal Employee Referral">Internal Employee Referral</option>
                  <option value="Direct Walk-in">Direct Walk-in</option>
                  <option value="Campus Placement">Campus Placement</option>
                  <option value="Agency / Headhunter">Agency / Headhunter</option>
                  <option value="Leadership Nomination">Leadership Nomination</option>
                </select>
              </div>
            </div>

            {/* Resume Upload (Optional) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Resume Upload (PDF / DOCX - Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setResumeFile(e.target.files[0] || null)}
                className="w-full text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                If uploaded, AI will automatically parse skills, education, and match criteria.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {loading ? 'Adding Candidate...' : 'Add to Pipeline'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
