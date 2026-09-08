import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  FileText, CheckCircle2, Clock, ArrowUpRight, Sparkles, 
  ToggleLeft, ToggleRight, Briefcase, Search, Play
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
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-semibold text-[10px] uppercase border border-zinc-200">
              Candidate Workspace
            </span>
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> AI Matched
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Welcome to your career space
          </h1>
          <p className="text-xs text-zinc-500 font-normal">
            Track interview invitations, explore AI matched job openings, and practice technical questions.
          </p>
        </div>

        {/* Status Toast */}
        {statusToast && (
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium animate-in fade-in">
            {statusToast}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            to="/candidate/jobs"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-subtle transition flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" /> Explore Jobs
          </Link>
        </div>
      </div>

      {/* 🌟 Open to Work Availability Card */}
      <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isOpenToWork 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-zinc-100 text-zinc-500 border-zinc-200'
          }`}>
            <Briefcase className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">Job Search Status</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isOpenToWork 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}>
                {isOpenToWork ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-normal">
              {isOpenToWork 
                ? 'Your profile is discoverable by recruiters looking for your skill set.' 
                : 'Your profile is paused from recruiter searches.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={togglingOpen}
          onClick={handleToggleOpenToWork}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition shadow-subtle shrink-0 self-start sm:self-auto ${
            isOpenToWork 
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
          }`}
        >
          {isOpenToWork ? (
            <>Active: Open to Work <ToggleRight className="w-4 h-4 text-emerald-600" /></>
          ) : (
            <>Inactive: Paused <ToggleLeft className="w-4 h-4 text-zinc-400" /></>
          )}
        </button>
      </div>

      {/* 🚀 AI Mock Interview Practice Card */}
      <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
            <Sparkles className="w-3 h-3 text-blue-400" /> AI Interview Simulator
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Practice AI Technical Mock Interview
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg font-normal leading-relaxed">
            Answer 4 AI-generated technical questions using voice or text. Receive real-time scoring, feedback, and ideal answer outlines.
          </p>
        </div>

        <button
          onClick={() => setShowMockInterview(true)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs transition flex items-center gap-2 shrink-0 shadow-subtle"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Launch Practice
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Invitations</span>
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.total_invitations}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.pending_count}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.interested_count}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Profile Strength</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.completion_pct}%</p>
        </div>

      </div>

      {/* Profile Strength Progress Bar Card */}
      <div className="p-5 sm:p-6 rounded-2xl space-y-3 bg-white border border-zinc-200/90 shadow-subtle">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
            Profile Strength &amp; AI Matching Index
          </span>
          <span className="font-bold text-zinc-900 text-xs">{stats.completion_pct}% Complete</span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${stats.completion_pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 font-normal">
          <span>Complete education, skills, and resume upload to maximize your match score.</span>
          {!stats.has_resume && (
            <Link to="/candidate/resume-upload" className="text-zinc-900 font-medium hover:underline flex items-center gap-1">
              Upload Resume <ArrowUpRight className="w-3 h-3" />
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
