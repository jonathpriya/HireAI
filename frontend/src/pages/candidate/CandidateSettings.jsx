import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Settings, ShieldCheck, Bell, Zap, Gift, Share2, 
  Copy, Check, History, Award, Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function CandidateSettings() {
  const [balanceData, setBalanceData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchCreditData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        API.get('/credits/balance'),
        API.get('/credits/history')
      ]);
      setBalanceData(balRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Failed to load candidate credit details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditData();
  }, []);

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
      registration_bonus: "🎁 Registration Bonus (10 Credits)",
      signup_referral_bonus: "🎉 Signup via Referral Link (+5 Credits)",
      referral_reward: "🚀 Friend Joined using Your Referral Code (+5 Credits)",
      accept_invitation: "✉️ Accepted Job Invitation (-2 Credits)",
      job_apply: "📄 Applied for Job (-2 Credits)"
    };
    return map[reason] || reason.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Account &amp; Credits</h1>
        <p className="text-xs text-slate-500 mt-1">Manage account details, invite friends, and view credit activity.</p>
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
            <p className="text-xs text-slate-500">Friends Joined</p>
            <p className="text-lg font-bold text-slate-900">{balanceData?.referral_count || 0} Referrals</p>
          </div>
        </div>

        {/* Unique Referral Code Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-500" /> Your Referral Link
            </label>
            <span className="text-[11px] text-amber-700 font-bold">Earn +5 bonus credits per referral</span>
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
