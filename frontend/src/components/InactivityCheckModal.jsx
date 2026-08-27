import React, { useState } from 'react';
import API from '../services/api';
import { 
  Bell, Briefcase, CheckCircle2, XCircle, Clock, Sparkles, AlertTriangle, 
  ThumbsUp, ThumbsDown, ShieldCheck, HeartHandshake
} from 'lucide-react';

export default function InactivityCheckModal({ daysInactive = 7, currentStatus = true, onClose, onStatusUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleChoose = async (isOpen) => {
    setSubmitting(true);
    try {
      const res = await API.patch('/candidate/open-to-work', {
        is_open_to_work: isOpen
      });

      setFeedbackMsg(
        isOpen
          ? "🎉 Awesome! Your profile is set to 'Active - Open to Work'. Recruiters can now discover you."
          : "👍 Understood! Your profile is set to 'Inactive'. You can re-enable anytime."
      );

      if (onStatusUpdated) {
        onStatusUpdated(isOpen);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to update open to work status", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-3xl border border-blue-500/40 bg-slate-950 p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/25">
            <Bell className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-black text-white">Welcome Back! 👋</h3>
          <p className="text-xs text-slate-400">
            It has been <strong className="text-blue-400">{daysInactive > 0 ? `${daysInactive}+ days` : 'over a week'}</strong> since your last visit.
          </p>
        </div>

        {/* Central Question Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <p className="text-sm font-extrabold text-white">
            Are you still actively looking for a job? 🎯
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Keeping your status updated ensures recruiters reach out with the most relevant interview opportunities.
          </p>
        </div>

        {feedbackMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* Option 1: Yes, Actively Looking */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleChoose(true)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-between transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 text-left">
                <ThumbsUp className="w-4 h-4 shrink-0" />
                <div>
                  <div>Yes, I am Actively Looking! 🚀</div>
                  <div className="text-[10px] font-normal opacity-85">Keep my profile Active for Recruiters</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded-md">Open to Work</span>
            </button>

            {/* Option 2: No, Found Job / Taking Break */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleChoose(false)}
              className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-between transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 text-left">
                <ThumbsDown className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div>No, I'm Not Looking Right Now ⏸️</div>
                  <div className="text-[10px] font-normal text-slate-400">Set status to Inactive (Pause recruiter outreach)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold bg-slate-800 px-2 py-0.5 rounded-md text-slate-400">Pause</span>
            </button>

            {/* Option 3: Remind Later */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline transition"
              >
                Remind me later
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
