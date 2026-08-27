import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Briefcase, MapPin, DollarSign, Search, Sparkles, Filter, 
  ArrowRight, ShieldCheck, CheckCircle2, Clock, Loader2 
} from 'lucide-react';
import SkillGapAnalyzerModal from '../../components/SkillGapAnalyzerModal';
import { useAuth } from '../../context/AuthContext';

export default function CandidateJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/candidate/jobs', {
        params: { search: search || undefined, location: location || undefined }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch candidate jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleInspectJobMatch = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore Matching Openings</h1>
          <p className="text-xs text-slate-500 mt-1">Discover roles matched to your skills by AI. Check your live match score and express interest.</p>
        </div>
        <div className="px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-2 self-start md:self-auto shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" /> AI Ranked Job Feed
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-300">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by job title or skill (e.g., Python, React, AWS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder-slate-400"
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-300">
          <MapPin className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-extrabold text-sm text-white rounded-2xl shadow-md shadow-blue-500/20 transition"
        >
          Search
        </button>
      </form>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3 font-semibold">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span>Loading recruiter posted jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No active job openings found</p>
          <p className="text-xs text-slate-500">Check back soon for new postings from recruiters.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-blue-300 transition-all shadow-sm hover:shadow-md bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {job.employment_type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 mt-0.5">{job.company_name}</p>
                </div>

                <span className="self-start px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Real-time Matching Active
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {job.experience_required}+ Yrs Experience
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> {job.salary}
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Bar */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleInspectJobMatch(job)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" /> Check Match &amp; Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Gap Analyzer Modal */}
      {selectedJob && (
        <SkillGapAnalyzerModal
          job={selectedJob}
          user={user}
          onClose={() => setSelectedJob(null)}
          onApplied={() => {
            fetchJobs();
          }}
        />
      )}

    </div>
  );
}
