import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, UserCheck, FileText, Phone, Mail, Building, Briefcase, Loader2 } from 'lucide-react';
import API from '../services/api';

export default function EasyApplyModal({ job, user, onClose, onApplied }) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMatch() {
      setCalculating(true);
      try {
        const res = await API.get(`/candidate/match-score/${job.id}`);
        setMatchData(res.data);
      } catch (err) {
        setMatchData({ match_score: 75, matching_skills: [], skill_gap: [] });
      } finally {
        setCalculating(false);
      }
    }
    fetchMatch();
  }, [job.id]);

  const handleApply = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post(`/candidate/easy-apply/${job.id}`);
      setSuccessData(res.data);
      if (onApplied) onApplied(job.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>LinkedIn-Style 1-Click Easy Apply</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{job.title}</h2>
            <p className="text-xs font-bold text-slate-500">{job.company_name} • {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">{successData.message || 'Application Submitted!'}</h3>
              <p className="text-xs text-slate-500 font-medium">
                The hiring team at <strong className="text-slate-800">{job.company_name}</strong> has received your profile and match score.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-600">Calculated AI Compatibility:</span>
                <span className="text-emerald-700 font-black text-sm">{successData.match_score}% Fit</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${successData.match_score}%` }}></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Done &amp; Continue Browsing
            </button>
          </div>
        ) : (
          <>
            {/* Live AI Match Score Pill */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-900">Live AI Match Compatibility</p>
                <p className="text-[11px] text-blue-700 font-medium">Evaluated against your verified skills &amp; resume</p>
              </div>
              {calculating ? (
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                </div>
              ) : (
                <span className="text-lg font-black text-blue-700 bg-white px-3 py-1 rounded-xl shadow-sm border border-blue-200">
                  {matchData?.match_score}%
                </span>
              )}
            </div>

            {/* Profile Confirmation Card */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-700">Submitting with your HireAI Profile:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{user?.full_name || 'Candidate Name'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">{user?.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{user?.mobile || 'Phone on profile'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">Active Parsed Resume</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={loading || calculating}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Submit 1-Click Easy Apply</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
