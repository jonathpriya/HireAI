import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search, MapPin, Briefcase, DollarSign, ChevronRight, X,
  CheckCircle, AlertTriangle, Sparkles, Loader2, Lock, TrendingUp,
  Award, Layers, ArrowRight
} from 'lucide-react';
import SkillGapAnalyzerModal from '../../components/SkillGapAnalyzerModal';
import EasyApplyModal from '../../components/EasyApplyModal';

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [easyApplyJob, setEasyApplyJob] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs', {
        params: { search: search || undefined, location: location || undefined }
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const targetJobId = searchParams.get('job_id') || searchParams.get('checkJob') || sessionStorage.getItem('pendingJobId');
    if (targetJobId && user && user.role === 'candidate' && jobs.length > 0) {
      sessionStorage.removeItem('pendingJobId');
      const targetJob = jobs.find(j => j.id === parseInt(targetJobId));
      if (targetJob) {
        handleInspectMatch(targetJob);
      }
    }
  }, [jobs, searchParams, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleInspectMatch = async (job) => {
    if (!user) {
      sessionStorage.setItem('pendingJobId', String(job.id));
      navigate(`/register?role=candidate&job_id=${job.id}`);
      return;
    }

    if (user.role !== 'candidate') {
      alert("Only candidates can check match scores and apply for positions.");
      return;
    }

    setMatchLoading(true);
    try {
      const res = await API.get(`/candidate/match-score/${job.id}`);
      const scoreData = res.data;

      setSelectedJob({
        ...job,
        match_score: scoreData.match_score,
        matching_skills: scoreData.matching_skills || [],
        skill_gap: scoreData.skill_gap || [],
      });
    } catch (err) {
      console.error("Failed to compute match score", err);
      setSelectedJob({
        ...job,
        match_score: 70,
        matching_skills: [],
        skill_gap: job.required_skills || [],
      });
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Match &amp; Skill Gap Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Career <span className="gradient-text">Job Openings</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm font-medium">
          Explore top tech positions. Click <strong className="text-blue-600">Check AI Match &amp; Skill Gap</strong> on any job to see your compatibility score and missing skills instantly!
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2.5 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-300">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title or skill (e.g., Python, React, DevOps)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder-slate-400 font-medium"
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2.5 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-300">
          <MapPin className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder-slate-400 font-medium"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-2xl shadow-sm transition"
        >
          Search Jobs
        </button>
      </form>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3 font-semibold">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span>Fetching active job openings...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-3 bg-white border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No job openings found</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or location filters.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200 bg-white hover:border-blue-300 transition shadow-sm hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {job.employment_type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">{job.company_name}</p>
                </div>

                {user && user.role === 'candidate' && (
                  <span className="self-start px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Instant AI Matching Active
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 font-medium">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-500" /> {job.experience_required}+ Yrs Experience Needed
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
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  {user && user.role === 'candidate'
                    ? 'AI calculates your match score & skill gaps'
                    : 'Sign in to check your AI match & skill gap'}
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleInspectMatch(job)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Skill Gap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        sessionStorage.setItem('pendingJobId', String(job.id));
                        navigate(`/register?role=candidate&job_id=${job.id}`);
                      } else {
                        setEasyApplyJob(job);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ 1-Click Easy Apply</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <SkillGapAnalyzerModal
          job={selectedJob}
          user={user}
          onClose={() => setSelectedJob(null)}
          onApplied={(jobId) => {
            fetchJobs();
          }}
        />
      )}

      {easyApplyJob && (
        <EasyApplyModal
          job={easyApplyJob}
          user={user}
          onClose={() => setEasyApplyJob(null)}
          onApplied={(jobId) => {
            fetchJobs();
          }}
        />
      )}

    </div>
  );
}
