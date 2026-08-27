import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Settings, ShieldCheck, Bell, Zap, Gift, Share2, 
  Copy, Check, History, Award, Sparkles, ArrowUpRight, ArrowDownRight, Briefcase, Calendar, Clock, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function RecruiterSettings() {
  const [balanceData, setBalanceData] = useState(null);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);

  const [autoSchedule, setAutoSchedule] = useState(false);
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes, profRes] = await Promise.all([
        API.get('/credits/balance'),
        API.get('/credits/history'),
        API.get('/recruiter/profile')
      ]);
      setBalanceData(balRes.data);
      setHistory(histRes.data);
      setProfile(profRes.data);
      setAutoSchedule(profRes.data.auto_schedule_interviews || false);
      setPreferredTime(profRes.data.preferred_interview_time || '10:00 AM');
    } catch (err) {
      console.error("Failed to load recruiter settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleToggleAutoSchedule = async (nextState) => {
    setAutoSchedule(nextState);
    setSavingSettings(true);
    try {
      await API.patch('/recruiter/settings/auto-schedule', {
        auto_schedule_interviews: nextState,
        preferred_interview_time: preferredTime
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update auto-schedule setting", err);
      setAutoSchedule(!nextState);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateTime = async (newTime) => {
    setPreferredTime(newTime);
    try {
      await API.patch('/recruiter/settings/auto-schedule', {
        auto_schedule_interviews: autoSchedule,
        preferred_interview_time: newTime
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update preferred time", err);
    }
  };

  const handleCopyCode = () => {
    if (!balanceData?.referral_code) return;
    navigator.clipboard.writeText(balanceData.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!balanceData?.referral_code) return;
    const shareUrl = `${window.location.origin}/register?ref=${balanceData.referral_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatReason = (reason) => {
    const map = {
      registration_bonus: "🎁 Registration Bonus (30 Credits)",
      signup_referral_bonus: "🎉 Signup via Referral Link",
      referral_reward: "🚀 Referral Reward (+20 Credits)",
      job_post: "💼 Posted Job Opening (-1 Credit)",
      resume_view: "🔓 Candidate Resume View (-1 Credit)",
      recruiter_contribution: "💡 Strategy Contribution (+5 Credits)"
    };
    return map[reason] || reason.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Account Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">Configure interview automation, manage credits, and team referral links.</p>
      </div>

      {/* ── ⚡ AI INTERVIEW AUTO-SCHEDULING CARD ── */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">⚡ Auto-Schedule on Candidate Acceptance</h3>
              <p className="text-xs text-slate-500">Automatically propose interview slots when a candidate accepts your invitation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggleAutoSchedule(!autoSchedule)}
            disabled={savingSettings}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              autoSchedule
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {autoSchedule ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                <span>Enabled (ON)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                <span>Manual (OFF)</span>
              </>
            )}
          </button>
        </div>

        {autoSchedule ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Preferred Time Slot:
              </span>
              <select
                value={preferredTime}
                onChange={(e) => handleUpdateTime(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold outline-none shadow-sm"
              >
                <option value="10:00 AM">10:00 AM (Morning)</option>
                <option value="11:30 AM">11:30 AM (Late Morning)</option>
                <option value="02:00 PM">02:00 PM (Afternoon)</option>
                <option value="03:30 PM">03:30 PM (Mid Afternoon)</option>
                <option value="05:00 PM">05:00 PM (Evening)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-600">
              When a candidate accepts an invitation, HireAI will book an interview 2 business days ahead at <strong className="text-slate-900">{preferredTime}</strong> with an auto-generated meeting link.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            💡 When disabled, you will get a <strong>"⚡ Smart Schedule"</strong> prompt with AI-suggested slots whenever a candidate accepts, allowing 1-click confirmation.
          </p>
        )}

        {saveSuccess && (
          <div className="text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Preferences saved!
          </div>
        )}
      </div>

      {/* Credit Balance & Referral Hub Card */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20">
              <Zap className="w-6 h-6 fill-current text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900">{balanceData?.credits || 0}</span>
                <span className="text-xs font-bold text-amber-600">Credits Available</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500">Invited Team Members</p>
            <p className="text-lg font-bold text-slate-900">{balanceData?.referral_count || 0} Referrals</p>
          </div>
        </div>

        {/* Unique Referral Code Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-500" /> Referral Code &amp; Link
            </label>
            <span className="text-[11px] text-amber-700 font-bold">Earn +20 credits per referral</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono font-black text-base text-slate-900 tracking-wider">
              {balanceData?.referral_code || "REF-CODE"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Audit History Ledger */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Credit Transaction History
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No credit transactions recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map((tx) => (
              <div key={tx.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">{formatReason(tx.reason)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(tx.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-black">
                  {tx.amount > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5 font-mono">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{tx.amount}
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-0.5 font-mono">
                      <ArrowDownRight className="w-3.5 h-3.5" /> {tx.amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
