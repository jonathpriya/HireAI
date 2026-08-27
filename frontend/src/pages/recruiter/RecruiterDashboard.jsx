import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Briefcase, CheckCircle2, XCircle, Clock, UserCheck, PlusCircle, 
  ArrowUpRight, Kanban, Search, Sparkles, Globe, GitMerge, Users, TrendingUp, Award
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

  const COLORS = ['#0a66c2', '#7c3aed', '#057642', '#e11d48'];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black text-[10px] uppercase border border-blue-200">
              Enterprise ATS
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Recruiter Pro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Recruiter <span className="gradient-text">Overview</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-lg">
            Monitor active job postings, applicant funnel velocity, and universal multi-channel sourcing in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/manage-jobs"
            className="px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Manage Jobs</span>
          </Link>
          <Link
            to="/recruiter/pipeline"
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <GitMerge className="w-4 h-4" />
            <span>Open Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Vibrant Colorful Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Jobs */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Total Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total_jobs}</p>
        </div>

        {/* Active Jobs */}
        <div className="glass-card p-5 rounded-3xl border border-emerald-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Active Openings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.active_jobs}</p>
        </div>

        {/* Interested Applicants */}
        <div className="glass-card p-5 rounded-3xl border border-purple-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Interested / Applied</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700">{stats.interested_candidates}</p>
        </div>

        {/* Pending Review */}
        <div className="glass-card p-5 rounded-3xl border border-amber-200 bg-white space-y-2 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending_responses}</p>
        </div>

        {/* Closed Jobs */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm hover:shadow-md transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Closed Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-600">{stats.closed_jobs}</p>
        </div>

      </div>

      {/* Analytics Chart & Sourcing Hub Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recruitment Funnel Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Candidate Pipeline Funnel
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">Live Velocity</span>
          </div>

          <div className="h-64 w-full">
            {stats.funnel_data && stats.funnel_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.funnel_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '16px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {stats.funnel_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No active funnel data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Portal Hub Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between gap-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" /> Connected Portals
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Live Sync</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-blue-200 flex items-center justify-between">
                <span className="font-bold text-blue-900">🔷 Naukri Resdex</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">Active 🟢</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-sky-200 flex items-center justify-between">
                <span className="font-bold text-sky-900">💼 LinkedIn Recruiter</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">Active 🟢</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-purple-200 flex items-center justify-between">
                <span className="font-bold text-purple-900">🟠 Foundit / Monster</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">Active 🟢</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-cyan-200 flex items-center justify-between">
                <span className="font-bold text-cyan-900">🌐 Google for Jobs</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">Auto-Indexed 🟢</span>
              </div>
            </div>
          </div>

          <Link
            to="/recruiter/integrations"
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
          >
            <span>Manage Portal Credentials</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
