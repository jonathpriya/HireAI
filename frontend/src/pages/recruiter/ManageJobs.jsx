import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Briefcase, Users, ToggleLeft, ToggleRight, MapPin, Calendar, ExternalLink, Globe, Sparkles, Share2 } from 'lucide-react';
import MultiChannelSyndicationModal from '../../components/MultiChannelSyndicationModal';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForSyndication, setSelectedJobForSyndication] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/recruiter/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch recruiter jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId) => {
    try {
      await API.patch(`/recruiter/jobs/${jobId}/toggle-status`);
      fetchJobs();
    } catch (err) {
      console.error("Failed to toggle job status", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manage Posted Jobs</h1>
          <p className="text-xs text-slate-500 mt-1">Review your active openings, toggle status, and syndicate across global job boards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/integrations"
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Globe className="w-4 h-4 text-blue-600" /> Job Board Integrations
          </Link>
          <Link
            to="/recruiter/post-job"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 hover:scale-105"
          >
            + Post New Job
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">Loading your jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-500 space-y-4 bg-white border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No jobs posted yet</p>
          <p className="text-xs text-slate-500">Post your first job opening to start matching top candidates.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200 bg-white hover:border-blue-300 transition shadow-sm hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {job.location}</span>
                    <span>•</span>
                    <span>{job.employment_type}</span>
                    <span>•</span>
                    <span>Min Exp: {job.experience_required} Years</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Multi-Channel Syndication Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedJobForSyndication(job)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" /> 1-Click Multi-Board Post
                  </button>

                  <button
                    onClick={() => handleToggleStatus(job.id)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs text-slate-700 font-bold flex items-center gap-1.5 transition"
                  >
                    {job.status === 'active' ? (
                      <>Status: Active <ToggleRight className="w-4 h-4 text-emerald-600" /></>
                    ) : (
                      <>Status: Closed <ToggleLeft className="w-4 h-4 text-slate-400" /></>
                    )}
                  </button>

                  <Link
                    to={`/recruiter/shortlisted/${job.id}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Users className="w-4 h-4" /> View Candidates
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {job.required_skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Channel Job Board Syndication Modal */}
      {selectedJobForSyndication && (
        <MultiChannelSyndicationModal
          job={selectedJobForSyndication}
          onClose={() => setSelectedJobForSyndication(null)}
        />
      )}
    </div>
  );
}
