import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Globe, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Key, Mail, 
  ExternalLink, Zap, Check, Lock, Sparkles, Send, Share2, Layers, UserCheck, 
  ArrowRight, Users, PlusCircle, Building2
} from 'lucide-react';
import ConnectPortalModal from '../../components/ConnectPortalModal';

export default function RecruiterIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Simulation State
  const [simJobId, setSimJobId] = useState('');
  const [simPlatform, setSimPlatform] = useState('naukri');
  const [simName, setSimName] = useState('Siddharth Menon');
  const [simEmail, setSimEmail] = useState('siddharth.menon@techcorp.in');
  const [simExp, setSimExp] = useState(4.5);
  const [simSkills, setSimSkills] = useState('Python, React, FastAPI, PostgreSQL, Docker, AWS');
  const [simulating, setSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState('');
  const [simError, setSimError] = useState('');

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const [intRes, jobRes] = await Promise.all([
        API.get('/recruiter/integrations'),
        API.get('/recruiter/jobs')
      ]);
      setIntegrations(intRes.data);
      setJobs(jobRes.data);
      if (jobRes.data.length > 0 && !simJobId) {
        setSimJobId(jobRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load integrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSimulateApplicant = async (e) => {
    e.preventDefault();
    if (!simJobId) {
      setSimError("Please select a job opening to simulate an applicant.");
      return;
    }
    setSimulating(true);
    setSimSuccess('');
    setSimError('');

    try {
      const skillsArray = simSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await API.post('/recruiter/simulate-external-candidate', {
        job_id: parseInt(simJobId),
        source_platform: simPlatform,
        candidate_name: simName,
        candidate_email: simEmail,
        experience_years: parseFloat(simExp) || 3.0,
        skills: skillsArray,
        current_company: "Global Tech Solutions",
        education: "B.E. Computer Science & Engineering"
      });

      setSimSuccess(`🎉 Success! Candidate '${res.data.candidate_name}' applied from ${simPlatform.toUpperCase()} and was added to the ATS Pipeline with ${res.data.match_score}% AI Match!`);
      fetchIntegrations();
    } catch (err) {
      console.error("Simulation error", err);
      setSimError(err.response?.data?.detail || "Failed to simulate external applicant ingestion.");
    } finally {
      setSimulating(false);
    }
  };

  const getPlatformIcon = (id) => {
    switch (id) {
      case 'naukri':
        return <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/40 shadow-md shadow-blue-500/10">NAUKRI</div>;
      case 'linkedin':
        return <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center font-black text-xs border border-sky-500/40 shadow-md shadow-sky-500/10">LINKEDIN</div>;
      case 'monster':
        return <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/40 shadow-md shadow-purple-500/10">FOUNDIT</div>;
      case 'indeed':
        return <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/40 shadow-md shadow-indigo-500/10">INDEED</div>;
      case 'google_jobs':
        return <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/40 shadow-md shadow-emerald-500/10">GOOGLE</div>;
      default:
        return <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/40 shadow-md shadow-amber-500/10">FEED</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Globe className="w-8 h-8 text-blue-400" />
            Job Board &amp; <span className="gradient-text">Subscription Integrations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your paid corporate accounts on <strong>Naukri Resdex, LinkedIn Recruiter, and Foundit/Monster</strong> for 1-Click Multi-Posting and Universal Candidate Ingestion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Universal ATS Sourcing Active
          </span>
        </div>
      </div>

      {/* Free Global Feeds Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-slate-900 border border-blue-500/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" /> 100% Automated Free Job Feeds (Google for Jobs &amp; Indeed XML)
            </h3>
            <p className="text-xs text-slate-400">
              Jobs posted on HireAI are automatically exposed as Schema.org JSON-LD structured data and XML feeds for global job crawlers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:8000/api/jobs/feed.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View XML Feed
            </a>
          </div>
        </div>
      </div>

      {/* Corporate Portals Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span>Loading connected employer portals...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {integrations.map((item) => (
            <div 
              key={item.id} 
              className={`glass-card p-6 rounded-3xl border transition flex flex-col justify-between gap-5 shadow-xl ${
                item.is_connected 
                  ? 'bg-slate-950/95 border-blue-500/40 hover:border-blue-500/60' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {getPlatformIcon(item.id)}
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                    item.is_connected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {item.is_connected ? '🟢 Connected' : '⚪ Not Linked'}
                  </span>
                </div>

                {/* Subscription Tier Details */}
                {item.subscription_plan && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Tier</span>
                      <span className="font-semibold text-blue-300">{item.subscription_plan}</span>
                    </div>
                    {item.sourced_candidates_count > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-extrabold text-[11px]">
                        {item.sourced_candidates_count} Applicants Sourced
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {item.account_email ? (
                    <span className="font-mono text-slate-300">Account: {item.account_email}</span>
                  ) : item.type === 'free_automatic' ? (
                    <span className="text-emerald-400 font-bold">100% Free Schema Automation</span>
                  ) : (
                    <span className="italic text-slate-500">Corporate subscription supported</span>
                  )}
                </div>

                {item.type !== 'free_automatic' && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      item.is_connected
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{item.is_connected ? 'Manage Account' : 'Connect & Login'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧪 Cross-Platform Applicant Ingestion Simulation Tool */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Test External Candidate Application Ingestion (Naukri, LinkedIn, Monster)
            </h3>
            <p className="text-xs text-slate-400">
              Simulate an external candidate applying from your connected Naukri or LinkedIn subscription to verify real-time AI matching and ATS Pipeline source attribution.
            </p>
          </div>
        </div>

        {simSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{simSuccess}</span>
          </div>
        )}

        {simError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{simError}</span>
          </div>
        )}

        <form onSubmit={handleSimulateApplicant} className="grid sm:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="block text-slate-300 font-bold mb-1">Target Job Opening</label>
            <select
              value={simJobId}
              onChange={(e) => setSimJobId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Application Origin Portal</label>
            <select
              value={simPlatform}
              onChange={(e) => setSimPlatform(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
            >
              <option value="naukri">🔷 Naukri.com (Resdex)</option>
              <option value="linkedin">💼 LinkedIn Talent</option>
              <option value="monster">🟠 Foundit / Monster</option>
              <option value="google_jobs">🌐 Google for Jobs</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Candidate Name</label>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Candidate Email</label>
            <input
              type="email"
              value={simEmail}
              onChange={(e) => setSimEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              value={simExp}
              onChange={(e) => setSimExp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Primary Skills (Comma-separated)</label>
            <input
              type="text"
              value={simSkills}
              onChange={(e) => setSimSkills(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={simulating}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Ingesting Applicant & Calculating AI Match...' : 'Ingest External Applicant into ATS Pipeline'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Connect Portal Modal */}
      {selectedPlatform && (
        <ConnectPortalModal
          platform={selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
          onConnected={() => {
            fetchIntegrations();
          }}
        />
      )}

    </div>
  );
}
