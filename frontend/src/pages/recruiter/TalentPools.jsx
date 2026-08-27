import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  FolderHeart, Bookmark, Sparkles, User, MapPin, Briefcase, 
  MessageSquare, FileText, Trash2, ExternalLink, Loader2, Search, ArrowRight 
} from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';

export default function TalentPools() {
  const [data, setData] = useState({ candidates: [], available_pools: [], total_count: 0 });
  const [activePool, setActivePool] = useState('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTalentPool = async (pool = 'All') => {
    setLoading(true);
    try {
      const res = await API.get('/recruiter/talent-pool', {
        params: { pool_name: pool === 'All' ? undefined : pool }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching talent pool', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalentPool(activePool);
  }, [activePool]);

  const handleRemoveCandidate = async (candidateId) => {
    if (!window.confirm('Remove candidate from this talent pool?')) return;
    try {
      await API.post('/recruiter/talent-pool/toggle', { candidate_id: candidateId });
      fetchTalentPool(activePool);
    } catch (err) {
      console.error('Error removing candidate', err);
    }
  };

  const filteredCandidates = data.candidates?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    c.current_company.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 shadow-sm mb-1.5">
            <Bookmark className="w-3.5 h-3.5 text-purple-600" />
            <span>Recruiter Talent Pools &amp; Bookmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Candidates</h1>
        </div>

        <Link
          to="/recruiter/sourcing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
        >
          <Search className="w-4 h-4" />
          <span>Source More Candidates</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pool Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActivePool('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activePool === 'All' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            All Candidates ({data.total_count})
          </button>
          {data.available_pools?.map((pool, idx) => (
            <button
              key={idx}
              onClick={() => setActivePool(pool)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activePool === pool ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              📁 {pool}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter saved candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-600 outline-none"
          />
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3 font-semibold">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <span>Fetching talent pool candidates...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No candidates in this talent pool yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Bookmark top talent from the <strong>Candidate Sourcing</strong> or <strong>Shortlisted Candidates</strong> pages to organize your custom talent pools!
          </p>
          <Link
            to="/recruiter/sourcing"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
          >
            Browse Candidate Sourcing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.saved_id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <AvatarWithBadge
                    src={cand.profile_pic_url}
                    name={cand.name}
                    isOpenToWork={cand.is_open_to_work}
                    size="md"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cand.name}</h3>
                    <p className="text-xs font-bold text-blue-600">{cand.current_company}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {cand.experience_years}+ Yrs Experience • {cand.education}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  📁 {cand.pool_name}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {cand.skills?.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/messages?user_id=${cand.candidate_id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>InMail</span>
                  </Link>

                  <Link
                    to={`/in/${cand.candidate_id}`}
                    target="_blank"
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>

                <button
                  onClick={() => handleRemoveCandidate(cand.candidate_id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove from saved talent pool"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
