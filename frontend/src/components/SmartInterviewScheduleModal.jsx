import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  Calendar, Clock, Video, X, Sparkles, Check, CheckCircle2, AlertCircle, Link as LinkIcon, Send, User, Briefcase
} from 'lucide-react';

export default function SmartInterviewScheduleModal({ invitationId, onClose, onScheduled }) {
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [data, setData] = useState(null);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/recruiter/smart-schedule-suggestions/${invitationId}`);
        setData(res.data);
        setInterviewDate(res.data.recommended_date);
        setInterviewTime(res.data.recommended_time);
        setMeetingLink(res.data.auto_meeting_link);
        setMessage(res.data.suggested_message);
      } catch (err) {
        console.error("Failed to load AI schedule suggestions", err);
        setError("Failed to load AI scheduling suggestions.");
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) {
      fetchSuggestions();
    }
  }, [invitationId]);

  const handleSelectSlot = (slot, index) => {
    setSelectedSlotIndex(index);
    setInterviewDate(slot.date);
    setInterviewTime(slot.time);
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    setScheduling(true);
    setError('');

    try {
      await API.post('/recruiter/send-interview-invite', {
        invitation_id: invitationId,
        interview_date: interviewDate,
        interview_time: interviewTime,
        location_or_link: meetingLink,
        message: message
      });

      if (onScheduled) {
        onScheduled({
          invitation_id: invitationId,
          interview_date: interviewDate,
          interview_time: interviewTime,
          location_or_link: meetingLink
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to schedule interview", err);
      setError(err.response?.data?.detail || "Failed to schedule interview.");
    } finally {
      setScheduling(false);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                ⚡ Smart AI Interview Scheduler
              </h3>
              <p className="text-xs text-slate-400">
                Auto-generate slots, Google Meet link &amp; agenda with 1-click dispatch
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

        {/* Modal Body Form */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
            <span>Generating optimal AI interview slots &amp; meeting links...</span>
          </div>
        ) : (
          <form onSubmit={handleConfirmSchedule} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow text-xs">
            
            {/* Candidate & Job Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                  {data?.candidate_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-white block">{data?.candidate_name}</span>
                  <span className="text-[11px] text-slate-400">{data?.job_title}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Accepted Invitation
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* AI Suggested Slot Pills */}
            <div className="space-y-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 1-Click AI Suggested Interview Slots:
              </label>

              <div className="grid sm:grid-cols-3 gap-2">
                {data?.suggested_slots?.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSlot(slot, idx)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      selectedSlotIndex === idx
                        ? 'border-blue-500 bg-blue-500/15 text-white shadow-md'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium block truncate">{slot.label}</span>
                    <span className="font-bold text-xs text-white block">{slot.date}</span>
                    <span className="text-[11px] font-mono text-blue-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {slot.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Input Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Interview Date</label>
                <input
                  type="text"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Interview Time</label>
                <input
                  type="text"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-[11px] flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-emerald-400" /> Auto-Generated Meeting Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono text-xs outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Candidate Agenda / Message */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Interview Notes &amp; Agenda</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
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
                disabled={scheduling}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {scheduling ? 'Dispatching...' : 'Confirm & Send Schedule'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
