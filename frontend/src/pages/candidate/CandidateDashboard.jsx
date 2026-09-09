import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MatchScoreBadge from '../../components/MatchScoreBadge';
import { 
  FileText, CheckCircle2, Clock, Sparkles, 
  ToggleLeft, ToggleRight, Briefcase, Search, Play, ArrowRight,
  User, Bell, ChevronRight, Check, Building, MapPin, DollarSign
} from 'lucide-react';
import InactivityCheckModal from '../../components/InactivityCheckModal';
import AIMockInterviewModal from '../../components/AIMockInterviewModal';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completion_pct: 20,
    has_resume: false,
    is_open_to_work: true,
    total_invitations: 0,
    pending_count: 0,
    interested_count: 0,
    rejected_count: 0
  });
  const [recentInvitations, setRecentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
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

  const fetchRecentInvitations = async () => {
    try {
      const res = await API.get('/candidate/invitations');
      if (Array.isArray(res.data)) {
        setRecentInvitations(res.data.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to fetch recent invitations", err);
    } finally {
      setInvitesLoading(false);
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
    fetchRecentInvitations();
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

  const candidateName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ── Top Welcome & Action Banner ── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-600" /> AI Career Hub
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Candidate Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Welcome back, {candidateName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal max-w-xl">
            Track interview invitations from verified recruiters, polish your match profile, and practice AI technical interviews.
          </p>
        </div>

        {/* Right Header Actions: Compact Open-to-Work Toggle + Explore Jobs CTA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={togglingOpen}
            onClick={handleToggleOpenToWork}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition shadow-subtle ${
              isOpenToWork 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200'
            }`}
            title="Toggle recruiter search visibility"
          >
            <span className={`w-2 h-2 rounded-full ${isOpenToWork ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            <span>{isOpenToWork ? 'Open to Work' : 'Paused'}</span>
            {isOpenToWork ? (
              <ToggleRight className="w-4 h-4 text-emerald-600 ml-1" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-zinc-400 ml-1" />
            )}
          </button>

          <Link
            to="/candidate/jobs"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-subtle transition flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" /> Explore Jobs
          </Link>
        </div>
      </div>

      {/* Status Toast */}
      {statusToast && (
        <div className="p-3 rounded-xl bg-zinc-900 text-white text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{statusToast}</span>
          <button onClick={() => setStatusToast('')} className="text-zinc-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ── 4 KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invitations */}
        <Link 
          to="/candidate/job-invitations" 
          className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-md transition group block"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Invitations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900">{stats.total_invitations}</span>
            <span className="text-[11px] text-zinc-400 group-hover:text-zinc-900 flex items-center gap-0.5 font-medium transition">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Action Needed */}
        <Link 
          to="/candidate/job-invitations" 
          className={`p-5 rounded-2xl border bg-white hover:shadow-md transition group block ${
            stats.pending_count > 0 
              ? 'border-amber-300 ring-1 ring-amber-200/60' 
              : 'border-zinc-200/90 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Action Needed</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border group-hover:scale-105 transition ${
              stats.pending_count > 0 
                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                : 'bg-zinc-100 text-zinc-400 border-zinc-200'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${stats.pending_count > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
              {stats.pending_count}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
              stats.pending_count > 0 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}>
              {stats.pending_count > 0 ? 'Awaiting reply' : 'Caught up'}
            </span>
          </div>
        </Link>

        {/* Confirmed Matches */}
        <Link 
          to="/candidate/job-invitations" 
          className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-md transition group block"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Confirmed Matches</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900">{stats.interested_count}</span>
            <span className="text-[11px] text-emerald-600 font-medium">
              In pipeline
            </span>
          </div>
        </Link>

        {/* Profile Strength */}
        <Link 
          to="/candidate/profile" 
          className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-md transition group block"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Profile Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900">{stats.completion_pct}%</span>
            <span className="text-[11px] text-zinc-500 font-medium">
              {stats.completion_pct >= 80 ? 'High visibility' : 'Optimize profile'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 mt-2 overflow-hidden">
            <div 
              className="h-full bg-violet-600 rounded-full transition-all duration-500" 
              style={{ width: `${stats.completion_pct}%` }} 
            />
          </div>
        </Link>

      </div>

      {/* ── Main Two-Column Workspace Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Left Column (7 cols): Recent Invitations + Readiness Checklist ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card: Recent Recruiter Invitations */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Recent Job Invitations</h2>
                  <p className="text-xs text-zinc-500">Invitations received directly from interested recruiters</p>
                </div>
              </div>

              <Link
                to="/candidate/job-invitations"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            {invitesLoading ? (
              <div className="py-8 text-center text-zinc-400 text-xs font-medium animate-pulse">
                Loading recent invitations...
              </div>
            ) : recentInvitations.length === 0 ? (
              <div className="py-8 px-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center space-y-2">
                <Clock className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-sm font-semibold text-zinc-800">No invitations yet</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Keep your profile and resume updated. Verified recruiters will invite you for interviews matching your skillset.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Link
                    to="/candidate/jobs"
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition"
                  >
                    Browse Open Jobs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">
                          {inv.job_title}
                        </h4>
                        <MatchScoreBadge score={inv.match_score} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1 text-zinc-700 font-semibold">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          {inv.company_name}
                        </span>
                        {inv.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {inv.location}
                          </span>
                        )}
                        {inv.salary_min && (
                          <span className="flex items-center gap-1 text-zinc-600">
                            <DollarSign className="w-3 h-3 text-zinc-400" />
                            ₹{inv.salary_min} - ₹{inv.salary_max}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/candidate/job-invitations"
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition shadow-subtle"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Profile Readiness & Optimization Checklist */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Profile Readiness Checklist</h3>
                <p className="text-xs text-zinc-500">Step-by-step milestones to maximize recruiter outreach</p>
              </div>
              <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                {stats.completion_pct}% Complete
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.completion_pct}%` }}
              />
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Item 1: Profile Info */}
              <div className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-medium text-zinc-800">Basic Profile & Experience Details</span>
                </div>
                <Link to="/candidate/profile" className="text-blue-600 font-semibold hover:underline">
                  Edit
                </Link>
              </div>

              {/* Item 2: Resume */}
              <div className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    stats.has_resume ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {stats.has_resume ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Clock className="w-3 h-3" />}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-800">Resume Upload & Parsing</span>
                    {!stats.has_resume && <span className="text-amber-600 ml-1.5 font-normal">(Required)</span>}
                  </div>
                </div>
                <Link 
                  to="/candidate/resume-upload" 
                  className={`font-semibold ${stats.has_resume ? 'text-zinc-600 hover:underline' : 'text-blue-600 hover:underline'}`}
                >
                  {stats.has_resume ? 'Update' : 'Upload Now'}
                </Link>
              </div>

              {/* Item 3: Recruiter Discovery */}
              <div className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isOpenToWork ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {isOpenToWork ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="text-[10px] font-bold">!</span>}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-800">Open to Work Status</span>
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                      isOpenToWork ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {isOpenToWork ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleToggleOpenToWork} 
                  disabled={togglingOpen}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isOpenToWork ? 'Pause' : 'Activate'}
                </button>
              </div>

              {/* Item 4: AI Mock Interview */}
              <div className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-zinc-800">Practice AI Mock Technical Interview</span>
                </div>
                <button 
                  onClick={() => setShowMockInterview(true)} 
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Practice Now
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column (5 cols): AI Mock Practice + Quick Actions Hub ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Mock Technical Interview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white border border-zinc-800 shadow-xl space-y-5 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2 relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 text-[11px] font-medium border border-white/10">
                <Sparkles className="w-3 h-3 text-blue-400" /> AI Interview Simulator
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                AI Technical Interview Practice
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Prepare for technical screens with adaptive AI questions, voice/text answers, and instant scoring.
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 relative">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>4 adaptive technical questions based on your profile</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Voice input or typing response modes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Detailed model answers &amp; evaluation report</span>
              </div>
            </div>

            <button
              onClick={() => setShowMockInterview(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg relative"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Practice Session</span>
            </button>
          </div>

          {/* Quick Actions / Shortcuts Hub */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-zinc-900">Workspace Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/candidate/jobs"
                className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Explore Jobs</h4>
                  <p className="text-[11px] text-zinc-500">Search openings</p>
                </div>
              </Link>

              <Link
                to="/candidate/resume-upload"
                className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">My Resume</h4>
                  <p className="text-[11px] text-zinc-500">Upload &amp; parse</p>
                </div>
              </Link>

              <Link
                to="/candidate/profile"
                className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Edit Profile</h4>
                  <p className="text-[11px] text-zinc-500">Skills &amp; bio</p>
                </div>
              </Link>

              <Link
                to="/candidate/notifications"
                className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Notifications</h4>
                  <p className="text-[11px] text-zinc-500">Alerts &amp; updates</p>
                </div>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ── Inactivity Check Modal ── */}
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

      {/* ── AI Mock Interview Modal ── */}
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
