import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Search, User, FileText, CheckCircle, Lock, Unlock, Mail, Phone, MapPin, 
  Briefcase, Sparkles, Filter, Download, AlertCircle, MessageSquare, Bookmark, ExternalLink
} from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';
import { getFullImageUrl } from '../../utils/imageUrl';

export const getSourceBadge = (source) => {
  switch (source?.toLowerCase()) {
    case 'naukri':
      return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">Naukri</span>;
    case 'linkedin':
      return <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200">LinkedIn</span>;
    case 'monster':
      return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">Foundit</span>;
    case 'referral':
      return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">Referral</span>;
    default:
      return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">HireAI</span>;
  }
};

export default function RecruiterSourcing() {
  const [query, setQuery] = useState('');
  const [minExp, setMinExp] = useState(0);
  const [maxExp, setMaxExp] = useState(20);
  const [openOnly, setOpenOnly] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const [candidates, setCandidates] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState(null);
  const [error, setError] = useState('');

  const fetchSourcingResults = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/recruiter/sourcing', {
        params: {
          query: query || undefined,
          min_exp: minExp,
          max_exp: maxExp,
          open_only: openOnly,
          source_platform: selectedPlatform !== 'all' ? selectedPlatform : undefined
        }
      });
      setCandidates(res.data.candidates || []);
      setTotalResults(res.data.total_results || 0);
    } catch (err) {
      console.error("Failed to fetch candidate sourcing search", err);
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourcingResults();
  }, [openOnly, selectedPlatform]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSourcingResults();
  };

  const [savedCandidateIds, setSavedCandidateIds] = useState(new Set());

  const handleToggleBookmark = async (candId) => {
    try {
      const res = await API.post('/recruiter/talent-pool/toggle', { candidate_id: candId });
      setSavedCandidateIds(prev => {
        const next = new Set(prev);
        if (res.data.saved) next.add(candId);
        else next.delete(candId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Simple & Clean Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Candidate Sourcing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Discover verified talent across top job networks and connect directly.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Elegant, Simple Search Card */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          
          {/* Main Search Input */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title, skills, or keywords (e.g. Python Developer, React, AWS)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Search
            </button>
          </div>

          {/* Simple Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
            
            {/* Channel Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-bold mr-1">Source:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'linkedin', label: 'LinkedIn' },
                { id: 'naukri', label: 'Naukri' },
                { id: 'monster', label: 'Foundit' },
                { id: 'referral', label: 'Referrals' },
                { id: 'hireai', label: 'HireAI' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedPlatform(tab.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedPlatform === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Experience & Open to Work */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">Experience:</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={minExp}
                  onChange={(e) => setMinExp(parseFloat(e.target.value) || 0)}
                  className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-slate-900 text-center font-bold text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={maxExp}
                  onChange={(e) => setMaxExp(parseFloat(e.target.value) || 30)}
                  className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-slate-900 text-center font-bold text-xs"
                />
                <span className="text-slate-500">Yrs</span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(e) => setOpenOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Open to Work</span>
              </label>

              <span className="text-slate-400 font-semibold border-l border-slate-200 pl-3">
                <strong className="text-slate-900">{totalResults}</strong> found
              </span>
            </div>

          </div>

        </form>
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-semibold">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <User className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No candidates match your search</p>
          <p className="text-xs text-slate-500">Try searching for different skills or widening the experience range.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {candidates.map((cand) => (
            <div key={cand.candidate_id} className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-3.5 shadow-sm hover:shadow-md hover:border-blue-300 transition">
              
              {/* Card Header: Avatar & Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarWithBadge
                    src={cand.profile_pic_url}
                    name={cand.full_name}
                    isOpenToWork={cand.is_open_to_work}
                    size="md"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{cand.full_name}</h3>
                      {getSourceBadge(cand.source_platform)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cand.education || 'Software Engineer'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {cand.experience_years} Yrs Exp
                      </span>
                      {cand.communication_score !== null && cand.communication_score !== undefined && (
                        <span className="text-[11px] font-bold text-purple-700">
                          • 🗣️ {cand.communication_score}% Comm
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bookmark / Talent Pool Trigger */}
                <button
                  type="button"
                  onClick={() => handleToggleBookmark(cand.candidate_id)}
                  className={`p-2 rounded-xl border transition ${
                    savedCandidateIds.has(cand.candidate_id)
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'border-slate-200 text-slate-400 hover:text-purple-600 hover:bg-slate-50'
                  }`}
                  title="Save to Recruiter Talent Pool"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.skills && cand.skills.length > 0 ? (
                  cand.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed</span>
                )}
              </div>

              {/* Contact / Action Area */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/messages?user_id=${cand.candidate_id}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>InMail</span>
                  </Link>

                  <Link
                    to={`/in/${cand.candidate_id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>

                <div className="shrink-0">
                  {cand.resume_url ? (
                    <a
                      href={cand.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" /> Resume
                    </a>
                  ) : null}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
