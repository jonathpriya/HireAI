import React, { useState } from 'react';
import API from '../services/api';
import { 
  Lock, Key, Mail, ShieldCheck, CheckCircle2, AlertCircle, 
  Sparkles, ExternalLink, Zap, Building2, User
} from 'lucide-react';

export default function ConnectPortalModal({ platform, onClose, onConnected }) {
  const [accountEmail, setAccountEmail] = useState(platform?.account_email || '');
  const [connectedUsername, setConnectedUsername] = useState(platform?.connected_username || '');
  const [subscriptionPlan, setSubscriptionPlan] = useState(platform?.subscription_plan || platform?.default_plan || '');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [autoSyndicate, setAutoSyndicate] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getPortalInfo = () => {
    switch (platform?.id) {
      case 'naukri':
        return {
          title: 'Naukri.com Employer Login (eHire / Resdex)',
          desc: 'Sign in with your Naukri Recruiter credentials or Resdex API token to auto-post jobs and cross-source resumes.',
          badge: 'Naukri Resdex Enterprise',
          plans: [
            'Naukri Super Platinum Enterprise (5000 CVs/mo)',
            'Naukri Corporate eHire Pro (2500 CVs/mo)',
            'Naukri Basic Employer Access'
          ]
        };
      case 'linkedin':
        return {
          title: 'LinkedIn Recruiter & Talent Solutions',
          desc: 'Connect your corporate LinkedIn Recruiter seat to broadcast jobs to LinkedIn Talent network and sync InMail applicants.',
          badge: 'LinkedIn Corporate Seat',
          plans: [
            'LinkedIn Recruiter Corporate Seat (Unlimited InMail)',
            'LinkedIn Recruiter Professional (Job Slots Included)',
            'LinkedIn Talent Starter'
          ]
        };
      case 'monster':
        return {
          title: 'Foundit / Monster eHire Enterprise',
          desc: 'Authenticate your Foundit / Monster employer account for 1-click syndication and resume database search.',
          badge: 'Foundit 360 Recruiter',
          plans: [
            'Foundit Enterprise Recruiter Access 360',
            'Monster FastForward Corporate Package',
            'Foundit Employer Standard'
          ]
        };
      case 'indeed':
        return {
          title: 'Indeed Sponsored Employer Account',
          desc: 'Connect your Indeed Employer API to automatically sponsor and sync job postings.',
          badge: 'Indeed Employer',
          plans: [
            'Indeed Sponsored Employer Pro',
            'Indeed Free XML Aggregator Feeds'
          ]
        };
      default:
        return {
          title: `Connect ${platform?.name}`,
          desc: 'Configure corporate employer credentials and auto-syndication preferences.',
          badge: 'Enterprise API',
          plans: ['Enterprise Corporate Plan']
        };
    }
  };

  const portal = getPortalInfo();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      await API.post('/recruiter/integrations/connect', {
        platform: platform.id,
        account_email: accountEmail,
        connected_username: connectedUsername || "HR Enterprise Recruiter",
        subscription_plan: subscriptionPlan || portal.plans[0],
        api_key_or_token: apiKey || "ACTIVE_ENTERPRISE_AUTHENTICATED_TOKEN",
        client_id: clientId,
        auto_syndicate: autoSyndicate
      });

      setSuccessMsg(`🎉 Successfully connected & authenticated with ${platform.name}!`);
      if (onConnected) onConnected();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Portal login error", err);
      setErrorMsg("Failed to authenticate with job portal. Please check your credentials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-blue-500/40 bg-slate-950 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase">
                {portal.badge}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Corporate Subscription
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{portal.title}</h3>
            <p className="text-xs text-slate-400">{portal.desc}</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          {/* Subscription Tier Selection */}
          <div className="space-y-1">
            <label className="block text-slate-300 font-bold">Corporate Subscription Tier / Package</label>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium outline-none focus:border-blue-500"
            >
              {portal.plans.map((plan, idx) => (
                <option key={idx} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">HR Recruiter Name / Seat</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma (Tech Lead HR)"
                value={connectedUsername}
                onChange={(e) => setConnectedUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Corporate Login Email</label>
              <input
                type="email"
                placeholder="hr@techcorp.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Portal API Token / Employer Password</label>
            <input
              type="password"
              placeholder="Enter portal password or API key token..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Leave blank to use pre-authorized enterprise corporate session.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Client / Partner ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. NAUKRI-ENT-48920"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              id="autoSynd"
              checked={autoSyndicate}
              onChange={(e) => setAutoSyndicate(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoSynd" className="cursor-pointer font-medium">
              Automatically post all new HireAI jobs to this subscription account
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{saving ? 'Authenticating...' : 'Sign In & Connect Portal'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
