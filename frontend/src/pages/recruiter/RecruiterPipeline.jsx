import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { 
  Kanban, Table, Search, Filter, Sparkles, User, Mail, Phone, MessageSquare, 
  ChevronRight, Download, CheckCircle, Clock, Award, Briefcase, ExternalLink, 
  ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Eye, Unlock, Lock, UserPlus
} from 'lucide-react';
import AIReachoutModal from '../../components/AIReachoutModal';
import SmartInterviewScheduleModal from '../../components/SmartInterviewScheduleModal';
import AddCandidateModal from '../../components/AddCandidateModal';
import { getFullImageUrl } from '../../utils/imageUrl';

export const getSourceBadge = (source) => {
  switch (source?.toLowerCase()) {
    case 'naukri':
      return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[9px] border border-blue-200">🔷 Naukri</span>;
    case 'linkedin':
      return <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-extrabold text-[9px] border border-sky-200">💼 LinkedIn</span>;
    case 'monster':
      return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold text-[9px] border border-purple-200">🟠 Foundit</span>;
    case 'referral':
      return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[9px] border border-emerald-200">🏢 Referral</span>;
    case 'google_jobs':
      return <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-extrabold text-[9px] border border-cyan-200">🌐 Google</span>;
    default:
      return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold text-[9px] border border-slate-200">🤖 HireAI</span>;
  }
};

const STAGES = [
  { id: 'interested', label: 'Interested / Applied', color: 'border-amber-300 bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-blue-300 bg-blue-50 text-blue-800', dot: 'bg-blue-600' },
  { id: 'client_submission', label: 'Client Submission', color: 'border-indigo-300 bg-indigo-50 text-indigo-800', dot: 'bg-indigo-600' },
  { id: 'client_approved', label: 'Client Approved', color: 'border-cyan-300 bg-cyan-50 text-cyan-800', dot: 'bg-cyan-600' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: 'border-purple-300 bg-purple-50 text-purple-800', dot: 'bg-purple-600' },
  { id: 'interview_selected', label: 'Interview Selected', color: 'border-emerald-300 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-600' },
  { id: 'offered', label: 'Offer Extended', color: 'border-teal-300 bg-teal-50 text-teal-800', dot: 'bg-teal-600' },
  { id: 'onboarding', label: 'Onboarding / Joined 🎉', color: 'border-green-300 bg-green-50 text-green-800', dot: 'bg-green-600' },
  { id: 'client_rejected', label: 'Client Rejected', color: 'border-rose-200 bg-rose-50 text-rose-800', dot: 'bg-rose-500' },
  { id: 'interview_rejected', label: 'Interview Rejected', color: 'border-orange-200 bg-orange-50 text-orange-800', dot: 'bg-orange-500' },
  { id: 'rejected', label: 'Archived / Rejected', color: 'border-slate-300 bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
];

export default function RecruiterPipeline() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job_id') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [stageTab, setStageTab] = useState('all'); // 'all' | 'active' | 'rejections'

  const [pipelineData, setPipelineData] = useState({ total_candidates: 0, stage_counts: {}, candidates: [] });
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);
  const [selectedForReachout, setSelectedForReachout] = useState(null);
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await API.get('/recruiter/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const fetchPipeline = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/recruiter/pipeline', {
        params: { job_id: selectedJobId || undefined }
      });
      setPipelineData(res.data);
    } catch (err) {
      console.error("Failed to fetch pipeline data", err);
      setError("Failed to load recruiter pipeline data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [selectedJobId]);

  const handleStageChange = async (invitationId, newStage) => {
    setMovingId(invitationId);
    try {
      await API.put('/recruiter/pipeline/stage', {
        invitation_id: invitationId,
        stage: newStage
      });
      setPipelineData(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => c.invitation_id === invitationId ? { ...c, stage: newStage, status: newStage } : c)
      }));
    } catch (err) {
      console.error("Failed to update candidate stage", err);
    } finally {
      setMovingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!pipelineData.candidates.length) return;
    const headers = ["Candidate Name", "Email", "Mobile", "Job Title", "Stage", "Match Score", "Comm Score", "Experience Yrs", "Skills"];
    const rows = pipelineData.candidates.map(c => [
      `"${c.candidate_name}"`,
      `"${c.email}"`,
      `"${c.mobile}"`,
      `"${c.job_title}"`,
      `"${c.stage}"`,
      `"${c.match_score}%"`,
      `"${c.communication_score ? c.communication_score + '%' : 'N/A'}"`,
      `"${c.experience_years}"`,
      `"${(c.skills || []).join(', ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HireAI_Candidate_Pipeline_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = pipelineData.candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const skillsMatch = (c.skills || []).some(s => s.toLowerCase().includes(q));
    const matchesSearch = (
      c.candidate_name?.toLowerCase().includes(q) ||
      c.job_title?.toLowerCase().includes(q) ||
      c.current_company?.toLowerCase().includes(q) ||
      skillsMatch
    );

    const matchesSource = (sourceFilter === 'all') || (
      (c.source_platform || 'hireai').toLowerCase() === sourceFilter.toLowerCase()
    );

    return matchesSearch && matchesSource;
  });

  return (
    <div className="max-w-[1550px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            Hiring <span className="gradient-text">Pipeline &amp; Candidates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track candidates across hiring stages, generate 1-click personalized AI outreach, and manage applicant progression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddCandidateModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 transition shadow-md shadow-blue-500/20 hover:scale-105"
          >
            <UserPlus className="w-4 h-4" /> Add Candidate / Referral
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>

          {/* View Mode Toggle: Kanban ⇄ Table */}
          <div className="p-1 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Pipeline Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table View
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Job Selector + Search Bar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Job Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 transition w-full sm:w-56"
            >
              <option value="">All Job Openings ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
              ))}
            </select>
          </div>

          {/* Sourcing Channel Origin Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600 shrink-0" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-600 transition"
            >
              <option value="all">🌐 All Channels / Portals</option>
              <option value="naukri">🔷 Naukri.com</option>
              <option value="linkedin">💼 LinkedIn Talent</option>
              <option value="monster">🟠 Foundit</option>
              <option value="google_jobs">🌐 Google for Jobs</option>
              <option value="referral">🏢 Internal Referral</option>
              <option value="hireai">🤖 HireAI Direct</option>
            </select>
          </div>
        </div>

        {/* Candidate Search Query */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, skill, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3 font-semibold">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span>Loading hiring pipeline...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <User className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No candidates found in this pipeline view</p>
          <p className="text-xs text-slate-500">Post a job or broadcast candidate invitations to populate your hiring pipeline.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        
        /* ─── KANBAN BOARD VIEW ─── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Stages' },
                { id: 'active', label: 'Active Pipeline' },
                { id: 'rejections', label: 'Rejections / Archived' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStageTab(tab.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    stageTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-500">
              Total Candidates: <strong className="text-slate-900">{filteredCandidates.length}</strong>
            </span>
          </div>

          {/* Horizontal Scrollable Kanban Columns */}
          <div className="flex gap-4 overflow-x-auto pb-6 items-start">
            {STAGES.filter(stage => {
              if (stageTab === 'active') {
                return !['client_rejected', 'interview_rejected', 'rejected'].includes(stage.id);
              }
              if (stageTab === 'rejections') {
                return ['client_rejected', 'interview_rejected', 'rejected'].includes(stage.id);
              }
              return true;
            }).map((stage) => {
              const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);

              return (
                <div key={stage.id} className="glass-card rounded-3xl border border-slate-200 bg-slate-100/70 p-3.5 space-y-3 flex flex-col w-80 shrink-0 min-h-[550px] shadow-sm">
                  
                  {/* Column Stage Header */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                      <span className="font-bold text-xs text-slate-900 truncate">{stage.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards in Stage Column */}
                  <div className="space-y-3 flex-grow">
                    {stageCandidates.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs italic">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageCandidates.map((cand) => (
                        <div 
                          key={cand.invitation_id}
                          className="glass-card p-4 rounded-2xl border border-slate-200 bg-white space-y-3 hover:border-blue-300 transition shadow-sm hover:shadow-md"
                        >
                          {/* Header: Name, Experience & Match Score */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-blue-700">
                                {cand.profile_pic_url ? (
                                  <img src={getFullImageUrl(cand.profile_pic_url)} alt={cand.candidate_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{cand.candidate_name?.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{cand.candidate_name}</h4>
                                  {getSourceBadge(cand.source_platform)}
                                </div>
                                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  {cand.current_company || 'Software Engineer'}
                                </p>
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {cand.experience_years}Y Exp
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                cand.match_score >= 80 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {cand.match_score}% Match
                              </span>

                              {cand.communication_score !== null && cand.communication_score !== undefined && (
                                <span className="text-[9px] font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                  🗣️ {Math.round(cand.communication_score)}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Job Reference */}
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 truncate flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{cand.job_title}</span>
                          </div>

                          {/* Top Skills */}
                          <div className="flex flex-wrap gap-1">
                            {(cand.skills || []).slice(0, 3).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Card Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedForReachout(cand)}
                                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1 transition"
                                title="Generate AI outreach"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" /> AI Reachout
                              </button>

                              {(cand.stage === 'interested' || cand.stage === 'shortlisted') && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedForSchedule(cand.invitation_id)}
                                  className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
                                  title="1-Click AI Smart Interview Schedule"
                                >
                                  ⚡ Schedule
                                </button>
                              )}
                            </div>

                            {/* Quick WhatsApp Link */}
                            {cand.mobile && cand.is_unlocked && (
                              <a
                                href={`https://wa.me/${cand.mobile.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            )}

                            {/* Stage Transition Selector */}
                            <select
                              value={cand.stage}
                              disabled={movingId === cand.invitation_id}
                              onChange={(e) => handleStageChange(cand.invitation_id, e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-800 outline-none"
                            >
                              <option value="interested">Interested / Applied</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="client_submission">Client Submission</option>
                              <option value="client_approved">Client Approved</option>
                              <option value="interview_scheduled">Interview Scheduled</option>
                              <option value="interview_selected">Interview Selected</option>
                              <option value="offered">Offer Extended</option>
                              <option value="onboarding">Onboarding / Joined 🎉</option>
                              <option value="client_rejected">Client Rejected</option>
                              <option value="interview_rejected">Interview Rejected</option>
                              <option value="rejected">Archived / Rejected</option>
                            </select>

                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        
        /* ─── DATA TABLE / DIRECTORY VIEW ─── */
        <div className="glass-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Match &amp; Comm Score</th>
                  <th className="p-4">Top Skills</th>
                  <th className="p-4">Hiring Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredCandidates.map((cand) => (
                  <tr key={cand.invitation_id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Candidate Name & Current Role */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-blue-700 text-xs">
                          {cand.profile_pic_url ? (
                            <img src={getFullImageUrl(cand.profile_pic_url)} alt={cand.candidate_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{cand.candidate_name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs block">{cand.candidate_name}</span>
                            {getSourceBadge(cand.source_platform)}
                          </div>
                          <span className="text-[11px] text-slate-500">{cand.current_company || 'Software Engineer'}</span>
                          <span className="text-[10px] text-blue-600 block font-mono">Job: {cand.job_title}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="p-4 text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> {cand.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {cand.mobile}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="p-4 font-bold text-slate-900 text-xs">
                      {cand.experience_years} Years
                    </td>

                    {/* Match Score & Comm Score */}
                    <td className="p-4 space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        cand.match_score >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {cand.match_score}% Match
                      </span>
                      {cand.communication_score !== null && cand.communication_score !== undefined && (
                        <span className="block text-[10px] text-purple-700 font-bold">
                          🗣️ Comm: {Math.round(cand.communication_score)}%
                        </span>
                      )}
                    </td>

                    {/* Top Skills */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(cand.skills || []).slice(0, 4).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Stage Dropdown */}
                    <td className="p-4">
                      <select
                        value={cand.stage}
                        disabled={movingId === cand.invitation_id}
                        onChange={(e) => handleStageChange(cand.invitation_id, e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                      >
                        <option value="interested">Interested / Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="client_submission">Client Submission</option>
                        <option value="client_approved">Client Approved</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="interview_selected">Interview Selected</option>
                        <option value="offered">Offer Extended</option>
                        <option value="onboarding">Onboarding / Joined 🎉</option>
                        <option value="client_rejected">Client Rejected</option>
                        <option value="interview_rejected">Interview Rejected</option>
                        <option value="rejected">Archived / Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {(cand.stage === 'interested' || cand.stage === 'shortlisted') && (
                        <button
                          type="button"
                          onClick={() => setSelectedForSchedule(cand.invitation_id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs inline-flex items-center gap-1 transition shadow-sm"
                        >
                          ⚡ Schedule
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedForReachout(cand)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Reachout
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Auto-Reachout Modal */}
      {selectedForReachout && (
        <AIReachoutModal
          candidate={selectedForReachout}
          onClose={() => setSelectedForReachout(null)}
        />
      )}

      {/* ⚡ Smart Interview Schedule Modal */}
      {selectedForSchedule && (
        <SmartInterviewScheduleModal
          invitationId={selectedForSchedule}
          onClose={() => setSelectedForSchedule(null)}
          onScheduled={(details) => {
            setPipelineData(prev => ({
              ...prev,
              candidates: prev.candidates.map(c => c.invitation_id === details.invitation_id ? { ...c, stage: 'interview_scheduled', status: 'interview_scheduled' } : c)
            }));
          }}
        />
      )}

      {/* ➕ Add Candidate / Internal Referral Modal */}
      {showAddCandidateModal && (
        <AddCandidateModal
          defaultJobId={selectedJobId}
          jobs={jobs}
          onClose={() => setShowAddCandidateModal(false)}
          onCandidateAdded={(newCand) => {
            fetchPipeline();
          }}
        />
      )}

    </div>
  );
}
