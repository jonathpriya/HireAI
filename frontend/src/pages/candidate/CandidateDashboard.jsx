import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  User, FileText, CheckCircle2, Clock, XCircle, ArrowUpRight, Award, Sparkles, 
  ToggleLeft, ToggleRight, Bell, ShieldCheck, Zap, Briefcase, ChevronRight, Search,
  MessageSquare, Play
} from 'lucide-react';
import InactivityCheckModal from '../../components/InactivityCheckModal';
import AIMockInterviewModal from '../../components/AIMockInterviewModal';

export default function CandidateDashboard() {
  const [stats, setStats] = useState({
    completion_pct: 20,
    has_resume: false,
    is_open_to_work: true,
    total_invitations: 0,
    pending_count: 0,
    interested_count: 0,
    rejected_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactiveDays, setInactiveDays] = useState(7);
  const [statusToast, setStatusToast] = useState('');
  
  // AI Mock Interview Modal State
  const [showMockInterview, setShowMockInterview] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/candidate');
      setStats(res.data);
      if (res.data.is_open_to_work !== undefined) {
        setIsOpenToWork(res.data.is_open_to_work);
      }
    } catch (err) {
      console.error("Failed to load candidate stats", err);
    } finally {
      setLoading(false);
    }
  };

  const checkInactivity = async () => {
    try {
      const res = await API.get('/candidate/inactivity-check');
      if (res.data.prompt_needed) {
        setInactiveDays(res.data.days_inactive);
        setShowInactivityModal(true);
      }
    } catch (err) {
      console.error("Failed to check inactivity", err);
    }
  };

  useEffect(() => {
    fetchStats();
    checkInactivity();
  }, []);

  const handleToggleOpenToWork = async () => {
    const nextStatus = !isOpenToWork;
    setTogglingOpen(true);
    try {
      await API.patch('/candidate/open-to-work', { is_open_to_work: nextStatus });
      setIsOpenToWork(nextStatus);
      setStatusToast(nextStatus ? "🟢 Status: Active - Open to Work" : "🔴 Status: Inactive (Paused)");
      setTimeout(() => setStatusToast(''), 3000);
    } catch (err) {
      console.error("Failed to toggle open to work", err);
    } finally {
      setTogglingOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      
      {/* Top Banner Card */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase border border-blue-200">
              Candidate Hub
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Job Matcher
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to Your <span className="gradient-text">Career Space</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track interview invitations, explore AI matched job openings, and practice with AI Mock Interviewer.
          </p>
        </div>

        {/* Status Toast */}
        {statusToast && (
          <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold animate-in fade-in">
            {statusToast}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            to="/candidate/jobs"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 hover:scale-105"
          >
            <Search className="w-4 h-4" /> Explore Matching Jobs
          </Link>
        </div>
      </div>

      {/* 🌟 Open to Work Availability Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
            isOpenToWork 
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20' 
              : 'bg-slate-200 text-slate-600'
          }`}>
            <Briefcase className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900">Job Search Status</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border ${
                isOpenToWork 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {isOpenToWork ? '🟢 Open to Work' : '🔴 Inactive (Paused)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isOpenToWork 
                ? 'Your profile is active and discoverable by recruiters in candidate search.' 
                : 'Your profile is paused from recruiter searches.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={togglingOpen}
          onClick={handleToggleOpenToWork}
          className={`px-5 py-2.5 rounded-2xl border text-xs font-extrabold flex items-center gap-2 transition shadow-sm shrink-0 self-start sm:self-auto ${
            isOpenToWork 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-emerald-500/20' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {isOpenToWork ? (
            <>Active: Open to Work <ToggleRight className="w-5 h-5 text-white" /></>
          ) : (
            <>Inactive: Paused <ToggleLeft className="w-5 h-5 text-slate-500" /></>
          )}
        </button>
      </div>

      {/* 🚀 AI Mock Interview Practice Card */}
      <div className="glass-card p-6 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> AI Interview Simulator
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Practice AI Mock Technical Interview
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
            Answer 4 AI-generated technical questions using 🎤 <strong>Voice Input</strong> or <strong>Text</strong>. Get real-time grading, word count analysis, and ideal answer outlines.
          </p>
        </div>

        <button
          onClick={() => setShowMockInterview(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-extrabold text-xs shadow-xl shadow-purple-500/30 transition flex items-center gap-2 shrink-0 hover:scale-105"
        >
          <Play className="w-4 h-4 fill-current" /> Launch Practice Interview
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Invitations</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total_invitations}</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending_count}</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.interested_count}</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Profile Strength</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700">{stats.completion_pct}%</p>
        </div>

      </div>

      {/* Profile Strength Progress Bar Card */}
      <div className="glass-card p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> Profile Strength &amp; AI Matching Index
          </span>
          <span className="font-extrabold text-blue-600 text-sm">{stats.completion_pct}% Complete</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.completion_pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Complete education, skills, and resume upload to boost your AI match rankings.</span>
          {!stats.has_resume && (
            <Link to="/candidate/resume-upload" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              Upload Resume <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Inactivity Check Modal */}
      {showInactivityModal && (
        <InactivityCheckModal
          daysInactive={inactiveDays}
          currentStatus={isOpenToWork}
          onClose={() => setShowInactivityModal(false)}
          onStatusUpdated={(newStatus) => {
            setIsOpenToWork(newStatus);
            setStats(prev => ({ ...prev, is_open_to_work: newStatus }));
          }}
        />
      )}

      {/* AI Mock Interview Modal */}
      {showMockInterview && (
        <AIMockInterviewModal
          invitationId={1}
          jobTitle="Software Engineer & AI Specialist"
          companyName="HireAI Partner"
          onClose={() => setShowMockInterview(false)}
        />
      )}

    </div>
  );
}
