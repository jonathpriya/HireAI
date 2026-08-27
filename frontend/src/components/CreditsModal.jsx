import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  Sparkles, X, Copy, Check, Gift, Share2, Award, 
  ArrowUpRight, ArrowDownRight, History, Zap, ArrowLeft, Link as LinkIcon
} from 'lucide-react';

export default function CreditsModal({ onClose, onBalanceUpdate }) {
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
      if (onBalanceUpdate) {
        onBalanceUpdate(balRes.data.credits);
      }
    } catch (err) {
      console.error("Failed to load credit details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditData();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const refCode = balanceData?.referral_code || "REF-CODE";
  const shareUrl = `${window.location.origin}/register?ref=${refCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatReason = (reason) => {
    const map = {
      registration_bonus: "🎁 Registration Bonus",
      signup_referral_bonus: "🎉 Joined via Referral Link",
      referral_reward: "🚀 Referral Reward",
      job_post: "💼 Job Post (-1 Credit)",
      accept_invitation: "✉️ Accepted Invitation (-1 Credit)",
      job_apply: "📄 Job Application (-1 Credit)",
      resume_view: "🔓 Resume View (-1 Credit)",
      recruiter_contribution: "💡 Strategy Contribution (+5 Credits)"
    };
    return map[reason] || reason.replace(/_/g, ' ').toUpperCase();
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-2xl w-full max-h-[92vh] rounded-3xl border border-slate-200 flex flex-col shadow-2xl bg-white overflow-hidden relative z-[10000]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Credits &amp; Referrals</h3>
              <p className="text-xs text-slate-500">Share your referral link to earn free credit bonus points</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3 font-semibold">
            <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            <span>Loading credits...</span>
          </div>
        ) : (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">

            {/* ── REFERRAL CARD ── */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" /> Referral Code &amp; Link
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {balanceData?.referral_count || 0} Invited
                </span>
              </div>

              {/* Code Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block">Referral Code</span>
                  <span className="font-mono font-black text-lg text-slate-900 tracking-wider">
                    {refCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-300"
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

              {/* Share URL */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-600 truncate flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate select-all">{shareUrl}</span>
              </div>
            </div>

            {/* Credit Balance Summary Card */}
            <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Available Balance
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">{balanceData?.credits || 0}</span>
                  <span className="text-xs font-bold text-amber-600">Credits Available</span>
                </div>
              </div>
            </div>

            {/* Credit Audit History Ledger */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" /> Credit Transaction History
              </h4>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No credit transactions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((tx) => (
                    <div key={tx.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.amount > 0 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{formatReason(tx.reason)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-black text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                        <p className="text-[10px] text-slate-400">Bal: {tx.balance_after}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
