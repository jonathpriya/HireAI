import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MatchScoreBadge from '../../components/MatchScoreBadge';
import AIMockInterviewModal from '../../components/AIMockInterviewModal';
import { CheckCircle, XCircle, Clock, MapPin, Briefcase, DollarSign, Building, AlertCircle, Calendar, Sparkles, ExternalLink, Video } from 'lucide-react';

export default function JobInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [selectedInvitationForPrep, setSelectedInvitationForPrep] = useState(null);

  const fetchInvitations = async () => {
    try {
      const res = await API.get('/candidate/invitations');
      setInvitations(res.data);
    } catch (err) {
      console.error("Failed to fetch job invitations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (invitationId, action) => {
    setActionMsg('');
    try {
      await API.post(`/candidate/invitations/${invitationId}/respond`, { action });
      if (action === 'accept') {
        setActionMsg('🎉 Interest confirmed! Added to recruiter interview queue.');
      } else {
        setActionMsg('Invitation declined.');
      }
      fetchInvitations();
    } catch (err) {
      console.error("Failed to respond to invitation", err);
      setActionMsg(err.response?.data?.detail || "Failed to respond to invitation.");
    }
  };

  const getStatusDisplay = (inv) => {
    switch (inv.status) {
      case 'interview_scheduled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Interview Scheduled
          </span>
        );
      case 'interested':
      case 'shortlisted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Interest Confirmed
          </span>
        );
      case 'interview_selected':
      case 'offered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            🎉 Offer Extended
          </span>
        );
      case 'onboarding':
      case 'joined':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            🎉 Hired &amp; Joined
          </span>
        );
      case 'interview_rejected':
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            ✕ Declined / Closed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            ⏳ Pending Your Response
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Job Invitations</h1>
        <p className="text-xs text-slate-500 mt-1">Review invitations received from recruiters based on your AI match score.</p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-semibold">Checking pending job invitations...</div>
      ) : invitations.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No job invitations yet</p>
          <p className="text-xs text-slate-500">Ensure your candidate profile and resume are fully updated so recruiters can match with you!</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {invitations.map((inv) => (
            <div key={inv.id} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{inv.job_title}</h3>
                    <MatchScoreBadge score={inv.match_score} />
                  </div>
                  <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> {inv.company_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusDisplay(inv)}
                </div>
              </div>

              {/* Job Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {inv.location}</span>
                <span>•</span>
                <span>{inv.employment_type}</span>
                <span>•</span>
                <span>Min Exp: {inv.experience_required} Years</span>
                {inv.salary && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {inv.salary}</span>
                  </>
                )}
              </div>

              {/* Confirmed Interview Info Card (Only when interview is scheduled) */}
              {inv.status === 'interview_scheduled' && (inv.interview_date || inv.location_or_link) && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" /> Confirmed Interview Details
                    </span>
                    <span className="text-[11px] font-mono text-blue-700">
                      {inv.interview_date} at {inv.interview_time}
                    </span>
                  </div>

                  {inv.location_or_link && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-blue-600" /> Meeting Link:
                      </span>
                      {inv.location_or_link.startsWith('http') ? (
                        <a
                          href={inv.location_or_link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                        >
                          Join Meeting <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-bold text-slate-900">{inv.location_or_link}</span>
                      )}
                    </div>
                  )}

                  {inv.interview_message && (
                    <p className="text-[11px] text-slate-600 italic pt-1 border-t border-blue-100">
                      "{inv.interview_message}"
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvitationForPrep(inv)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition border border-purple-200"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" /> 🤖 AI Mock Interview Prep
                </button>

                {/* Only render Accept / Decline if pending */}
                {inv.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(inv.id, 'reject')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                    <button
                      onClick={() => handleRespond(inv.id, 'accept')}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Invitation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInvitationForPrep && (
        <AIMockInterviewModal
          invitationId={selectedInvitationForPrep.id}
          jobTitle={selectedInvitationForPrep.job_title}
          companyName={selectedInvitationForPrep.company_name}
          onClose={() => setSelectedInvitationForPrep(null)}
        />
      )}
    </div>
  );
}
