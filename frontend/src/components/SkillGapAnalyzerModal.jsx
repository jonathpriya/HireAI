import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  Sparkles, X, CheckCircle, AlertTriangle, ArrowRight, 
  Briefcase, Award, Zap, ShieldCheck, Check, Layers, ChevronRight
} from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';

export default function SkillGapAnalyzerModal({ job, user, onClose, onApplied }) {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [applyError, setApplyError] = useState('');

  const isCandidate = user && user.role === 'candidate';

  // Extract skills
  const reqSkills = job.required_skills || [];
  const candSkills = job.candidate_skills || (user?.skills || []);

  // Compute matching skills vs skill gap
  const reqLower = reqSkills.map(s => s.toLowerCase());
  const candLower = new Set(candSkills.map(s => s.toLowerCase()));

  const matchingSkills = reqSkills.filter(s => candLower.has(s.toLowerCase()));
  const skillGap = reqSkills.filter(s => !candLower.has(s.toLowerCase()));

  // Estimate match score if not already provided
  const matchScore = job.match_score !== undefined && job.match_score !== null
    ? job.match_score
    : reqSkills.length > 0 
      ? Math.round((matchingSkills.length / reqSkills.length) * 100)
      : 75;

  const handleApply = async () => {
    if (!user) {
      onClose();
      navigate(`/register?job_id=${job.id}`);
      return;
    }

    if (!isCandidate) {
      alert("Only candidates can apply for job positions.");
      return;
    }

    setApplying(true);
    setApplyMsg('');
    setApplyError('');

    try {
      await API.post(`/candidate/apply/${job.id}`);
      setApplyMsg("🎉 Application submitted successfully!");
      if (onApplied) onApplied(job.id);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.detail || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-2xl w-full max-h-[92vh] rounded-3xl border border-blue-500/40 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">AI Match &amp; Skill Gap Analyzer</h3>
              <p className="text-xs text-slate-400">Position: {job.title} at {job.company_name || "Company"}</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">

          {/* AI Match Score Hero Card */}


          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-slate-900 border-2 border-blue-500/40 grid sm:grid-cols-2 gap-4 items-center shadow-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-300" /> Your AI Compatibility Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{matchScore}%</span>
                <span className="text-xs font-bold text-blue-300">Match Score</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {matchScore >= 75 
                  ? "🎉 High Match! You qualify for automated recruiter shortlisting & invitations." 
                  : matchScore >= 55 
                  ? "⚡ Good Match! Bridge the skill gap below to boost your score to 80%+." 
                  : "💡 Moderate Match — Add missing skills to improve your compatibility."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Matching Skills:</span>
                <span className="font-bold text-emerald-400">{matchingSkills.length} / {reqSkills.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Missing Skill Gap:</span>
                <span className="font-bold text-amber-400">{skillGap.length} Skills</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Experience Needed:</span>
                <span className="font-bold text-slate-200">{job.experience_required || 0} Yrs</span>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Detailed Skill Matrix Comparison
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Matching Skills You Have ({matchingSkills.length})
                </span>

                {matchingSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No direct matching skills detected yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {matchingSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Skill Gap */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Missing Skill Gap to Acquire ({skillGap.length})
                </span>

                {skillGap.length === 0 ? (
                  <p className="text-xs text-emerald-400 font-semibold">🎉 Zero Skill Gap! You have all required skills for this job.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skillGap.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skill Gap Advice Card */}
            {skillGap.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">How to increase your Match Score:</span>
                  <p className="mt-0.5 text-slate-400">
                    Add missing skills like <strong className="text-amber-300">{skillGap.slice(0, 3).join(', ')}</strong> to your candidate profile or re-upload your updated resume to boost your match score above 80%!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Notifications */}
          {applyMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> <span>{applyMsg}</span>
            </div>
          )}

          {applyError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> <span>{applyError}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Close
          </button>

          {!user ? (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-500/20"
            >
              Sign Up as Candidate to Apply <ArrowRight className="w-4 h-4" />
            </button>
          ) : isCandidate ? (
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-emerald-500/20"
            >
              <Briefcase className="w-4 h-4" /> {applying ? "Submitting..." : "Apply for Position"}
            </button>

          ) : (
            <span className="text-xs text-slate-500 italic">Logged in as Recruiter</span>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
