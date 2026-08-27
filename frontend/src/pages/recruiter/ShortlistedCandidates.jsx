import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import MatchScoreBadge from '../../components/MatchScoreBadge';
import { Users, Download, Mail, Phone, CheckCircle, Clock, ArrowLeft, Award, Calendar, Send, X, User, AlertCircle, ArrowRight, MessageSquare, Bookmark, ExternalLink } from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function ShortlistedCandidates() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'interested', 'interview_scheduled', 'pending', 'rejected'
  const [loading, setLoading] = useState(true);

  // Invite Modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/recruiter/shortlist/${jobId}`, {
        params: { status_filter: filter }
      });
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to fetch shortlisted candidates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlist();
  }, [jobId, filter]);

  const handleOpenInviteModal = (cand) => {
    setSelectedCandidate(cand);
    setInterviewDate('');
    setInterviewTime('');
    setLocationOrLink('');
    setInviteMessage(`Hi ${cand.candidate_name}, we are impressed by your profile and would love to invite you for an interview.`);
    setInviteSuccess('');
  };

  const handleSendInterviewInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setSendingInvite(true);
    try {
      await API.post('/recruiter/send-interview-invite', {
        invitation_id: selectedCandidate.invitation_id,
        interview_date: interviewDate,
        interview_time: interviewTime,
        location_or_link: locationOrLink,
        message: inviteMessage
      });

      setInviteSuccess(`Interview invitation sent via email to ${selectedCandidate.candidate_name}!`);
      setTimeout(() => {
        setSelectedCandidate(null);
        fetchShortlist();
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send interview invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'interested':
      case 'shortlisted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Interested
          </span>
        );
      case 'interview_scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600" /> Interview Scheduled
          </span>
        );
      case 'interview_selected':
      case 'offered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-indigo-600" /> Offer Extended
          </span>
        );
      case 'onboarding':
      case 'joined':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            🎉 Hired / Joined
          </span>
        );
      case 'interview_rejected':
      case 'client_rejected':
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            ✕ Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            ⏳ Pending Response
          </span>
        );
    }
  };

  const isRejected = (status) => ['interview_rejected', 'client_rejected', 'rejected'].includes(status);
  const isScheduled = (status) => status === 'interview_scheduled';
  const isInterestedOrShortlisted = (status) => ['interested', 'shortlisted'].includes(status);
  const isOfferedOrJoined = (status) => ['offered', 'interview_selected', 'onboarding', 'joined'].includes(status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/recruiter/manage-jobs" className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 font-bold mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Jobs
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shortlisted Candidates</h1>
          <p className="text-xs text-slate-500 mt-1">Pre-vetted candidates ranked by AI Match Score</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Candidates
          </button>
          <button
            onClick={() => setFilter('interested')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'interested' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Interested
          </button>
          <button
            onClick={() => setFilter('interview_scheduled')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'interview_scheduled' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Interview Scheduled
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-semibold">Evaluating AI match results...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No candidates match filter "{filter}"</p>
          <p className="text-xs text-slate-500">Candidates will appear here as soon as they interact with this job.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {candidates.map((cand) => (
            <div 
              key={cand.invitation_id} 
              className={`glass-card p-6 rounded-3xl space-y-4 border transition shadow-sm hover:shadow-md ${
                isRejected(cand.status) 
                  ? 'border-rose-200 bg-rose-50/20' 
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Candidate Avatar and Details */}
                <div className="flex items-start gap-4">
                  <AvatarWithBadge
                    src={cand.profile_pic_url}
                    name={cand.candidate_name}
                    isOpenToWork={true}
                    size="md"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{cand.candidate_name}</h3>
                      <MatchScoreBadge score={cand.match_score} />
                      {cand.communication_score !== null && cand.communication_score !== undefined && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <span>🗣️ Comm Score:</span>
                          <span className="font-mono text-purple-800 font-black">{cand.communication_score}%</span>
                        </span>
                      )}
                      {getStatusBadge(cand.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-medium"><Mail className="w-3.5 h-3.5 text-blue-600" /> {cand.email}</span>
                      {cand.mobile && <span className="flex items-center gap-1 font-medium"><Phone className="w-3.5 h-3.5 text-indigo-600" /> {cand.mobile}</span>}
                      <span className="flex items-center gap-1 font-medium"><Award className="w-3.5 h-3.5 text-purple-600" /> Exp: {cand.experience_years} Years</span>
                      {cand.education && <span className="text-slate-500">🎓 {cand.education}</span>}
                    </div>
                  </div>
                </div>

                {/* Intelligent Conditional Action Buttons Based on Lifecycle Status */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <Link
                    to={`/messages?user_id=${cand.candidate_id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>InMail</span>
                  </Link>

                  <Link
                    to={`/in/${cand.candidate_id}`}
                    target="_blank"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>

                  {cand.resume_file_path && (
                    <a
                      href={cand.resume_file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Download className="w-4 h-4 text-blue-600" /> Resume
                    </a>
                  )}

                  {/* 1. If REJECTED -> DO NOT show Send Interview Invite */}
                  {isRejected(cand.status) ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        Candidate Rejected
                      </span>
                      <Link
                        to={`/recruiter/pipeline?job_id=${jobId}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                      >
                        Pipeline <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : isScheduled(cand.status) ? (
                    /* 2. If INTERVIEW SCHEDULED -> Show Reschedule + Pipeline */
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenInviteModal(cand)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" /> Reschedule
                      </button>
                      <Link
                        to={`/recruiter/pipeline?job_id=${jobId}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
                      >
                        ATS Pipeline <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : isOfferedOrJoined(cand.status) ? (
                    /* 3. If OFFERED OR JOINED -> Go to Pipeline */
                    <Link
                      to={`/recruiter/pipeline?job_id=${jobId}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
                    >
                      View in Pipeline <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : isInterestedOrShortlisted(cand.status) ? (
                    /* 4. If INTERESTED -> Primary Send Interview Invite button */
                    <button
                      type="button"
                      onClick={() => handleOpenInviteModal(cand)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Calendar className="w-4 h-4" /> Send Interview Invite
                    </button>
                  ) : (
                    /* 5. If PENDING -> Awaiting Response */
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        Awaiting Response
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenInviteModal(cand)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-sm"
                      >
                        Fast-Track Invite
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Matching Skills Breakdown */}
              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <p className="font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Matching Skills:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cand.matching_skills && cand.matching_skills.length > 0 ? (
                      cand.matching_skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None explicit</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Candidate Profile Skills:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cand.skills && cand.skills.length > 0 ? (
                      cand.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEND INTERVIEW INVITE MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Interview Invitation
              </h3>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-sm">
                ✓ {inviteSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendInterviewInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Candidate</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedCandidate.candidate_name} (${selectedCandidate.email})`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date *</label>
                    <input
                      type="date"
                      required
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Interview Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:30 AM EST"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link or Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://meet.google.com/xyz or Office HQ Room 3"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Invitation Message</label>
                  <textarea
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {sendingInvite ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
