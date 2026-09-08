import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Briefcase, CheckCircle2, XCircle, Clock, UserCheck, 
  ArrowUpRight, GitMerge, TrendingUp, Globe
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    closed_jobs: 0,
    pending_responses: 0,
    interested_candidates: 0,
    funnel_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/dashboard/recruiter');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load recruiter stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#2563eb', '#4f46e5', '#059669', '#dc2626'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-semibold text-[10px] uppercase border border-zinc-200">
              Enterprise ATS
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Real-time Hiring Metrics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Recruiter Overview
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg font-normal">
            Monitor active job postings, applicant funnel velocity, and multi-channel candidate pipeline in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/recruiter/manage-jobs"
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium transition flex items-center gap-1.5 shadow-subtle"
          >
            <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
            <span>Manage Jobs</span>
          </Link>
          <Link
            to="/recruiter/pipeline"
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-subtle"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Open Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium text-zinc-500">Total Jobs</span>
            <Briefcase className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.total_jobs}</p>
        </div>

        {/* Active Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium text-zinc-500">Active Openings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.active_jobs}</p>
        </div>

        {/* Interested Applicants */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium text-zinc-500">Interested / Applied</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.interested_candidates}</p>
        </div>

        {/* Pending Review */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium text-zinc-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.pending_responses}</p>
        </div>

        {/* Closed Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white space-y-1 shadow-subtle hover:border-zinc-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium text-zinc-500">Closed Jobs</span>
            <XCircle className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.closed_jobs}</p>
        </div>

      </div>

      {/* Analytics Chart & Sourcing Hub Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recruitment Funnel Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-200/90 bg-white space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-700" /> Candidate Pipeline Funnel
            </h3>
            <span className="text-xs text-zinc-400 font-medium">Live Stages</span>
          </div>

          <div className="h-64 w-full">
            {stats.funnel_data && stats.funnel_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.funnel_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e4e4e7', 
                      borderRadius: '12px',
                      color: '#09090b',
                      fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.funnel_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-medium">
                No active funnel data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Portal Hub Card */}
        <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white flex flex-col justify-between gap-5 shadow-subtle">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-700" /> Connected Portals
              </h3>
              <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Live Sync</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <span className="font-medium text-zinc-800">🔷 Naukri Resdex</span>
                <span className="text-[10px] text-emerald-700 font-medium">Active 🟢</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <span className="font-medium text-zinc-800">💼 LinkedIn Recruiter</span>
                <span className="text-[10px] text-emerald-700 font-medium">Active 🟢</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <span className="font-medium text-zinc-800">🟠 Foundit / Monster</span>
                <span className="text-[10px] text-emerald-700 font-medium">Active 🟢</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <span className="font-medium text-zinc-800">🌐 Google for Jobs</span>
                <span className="text-[10px] text-emerald-700 font-medium">Indexed 🟢</span>
              </div>
            </div>
          </div>

          <Link
            to="/recruiter/integrations"
            className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
          >
            <span>Manage Portal Credentials</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
        </div>

      </div>

    </div>
  );
}
