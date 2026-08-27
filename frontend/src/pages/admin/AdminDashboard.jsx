import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  Zap, 
  Mail, 
  UserCheck, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Trash2, 
  Lock,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, jobsRes, invRes, matchRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/jobs'),
        API.get('/admin/invitations'),
        API.get('/admin/match-results')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
      setInvitations(invRes.data);
      setMatchResults(matchRes.data);
    } catch (err) {
      console.error('Admin API Error:', err);
      setError(err.response?.data?.detail || 'Failed to load administrative data. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error deleting user');
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      const res = await API.patch(`/admin/jobs/${jobId}/toggle-status`);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: res.data.status } : j));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error updating job status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-lg font-medium">Fetching System Diagnostics & Database Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-8 rounded-2xl bg-red-950/40 border border-red-800/60 text-center text-red-200 shadow-2xl">
        <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-red-300 max-w-md mx-auto mb-6">{error}</p>
        <p className="text-xs text-slate-400">Only authorized platform administrators (@mycompany.com or Admin role) can access system controls.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin System Dashboard</h1>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Live System
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Full platform oversight, SQLite database statistics, job management, candidate shortlist audit, and AI engine diagnostics.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-medium text-sm self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            Refresh Data
          </button>
        </div>

        {/* Database Metric Overview Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.total_users}</div>
              <div className="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Cand: <strong className="text-blue-400">{stats.total_candidates}</strong></span>
                <span>Rec: <strong className="text-purple-400">{stats.total_recruiters}</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Vacancies</span>
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.total_jobs}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium">
                {stats.active_jobs} Active Postings
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Resumes</span>
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.total_resumes}</div>
              <div className="text-xs text-slate-400 mt-2">PDF & DOCX Parsed</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">AI Matches</span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.total_match_results}</div>
              <div className="text-xs text-amber-400/90 mt-2 font-medium">Cosine TF-IDF Matrix</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Invitations</span>
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.total_invitations}</div>
              <div className="text-xs text-slate-400 mt-2 flex gap-2">
                <span className="text-emerald-400">{stats.interested_invitations} Accepted</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Accepted Ratio</span>
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {stats.total_invitations > 0 ? `${Math.round((stats.interested_invitations / stats.total_invitations) * 100)}%` : '0%'}
              </div>
              <div className="text-xs text-slate-400 mt-2">Conversion Rate</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'System Summary', icon: Layers },
              { id: 'users', label: `User Directory (${users.length})`, icon: Users },
              { id: 'jobs', label: `Job Postings (${jobs.length})`, icon: Briefcase },
              { id: 'invitations', label: `Invitations (${invitations.length})`, icon: Mail },
              { id: 'matches', label: `AI Match Logs (${matchResults.length})`, icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {(activeTab === 'users' || activeTab === 'jobs') && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Database Component Breakdown
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-slate-200">Registered Candidates</span>
                  </div>
                  <p className="text-sm text-slate-400">Total job seekers registered with resume parses and skill matrices.</p>
                  <div className="mt-3 text-2xl font-bold text-blue-400">{stats?.total_candidates} Profiles</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-slate-200">Verified Recruiters</span>
                  </div>
                  <p className="text-sm text-slate-400">Corporate recruiters managing jobs and hiring cascades.</p>
                  <div className="mt-3 text-2xl font-bold text-purple-400">{stats?.total_recruiters} Companies</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Vacancies & Job Posts</span>
                  </div>
                  <p className="text-sm text-slate-400">Open job opportunities with required skills and criteria.</p>
                  <div className="mt-3 text-2xl font-bold text-emerald-400">{stats?.total_jobs} Total ({stats?.active_jobs} Active)</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-slate-200">Invitations Status</span>
                  </div>
                  <p className="text-sm text-slate-400">Candidate invitations & interview scheduling logs.</p>
                  <div className="mt-3 text-2xl font-bold text-amber-400">{stats?.total_invitations} Total ({stats?.interested_invitations} Accepted)</div>
                </div>
              </div>
            </div>

            {/* Quick Platform Security Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> Admin Security Rules
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Admin endpoints restricted to verified administrator credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>JWT Auth validation enabled across all API calls.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Automated AI Match score dynamic recalculation on job/candidate updates.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${roleFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setRoleFilter('candidate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${roleFilter === 'candidate' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Candidates ({users.filter(u=>u.role==='candidate').length})
                </button>
                <button
                  onClick={() => setRoleFilter('recruiter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${roleFilter === 'recruiter' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Recruiters ({users.filter(u=>u.role==='recruiter').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        {user.full_name}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          user.role === 'recruiter' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                          user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{user.mobile || 'N/A'}</td>
                      <td className="p-4 text-slate-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: JOB POSTINGS OVERSIGHT */}
        {activeTab === 'jobs' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Required Skills</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Invites Sent</th>
                    <th className="p-4 text-right">Toggle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">{job.title}</td>
                      <td className="p-4 text-slate-300">{job.company_name}</td>
                      <td className="p-4 text-slate-400">{job.location}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {job.required_skills?.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                              {s}
                            </span>
                          ))}
                          {job.required_skills?.length > 3 && (
                            <span className="text-xs text-slate-400">+{job.required_skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          job.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-blue-400">{job.invitation_count}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleJob(job.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                            job.status === 'active'
                              ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-800'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVITATION LOGS */}
        {activeTab === 'invitations' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Match Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Sent At</th>
                    <th className="p-4">Responded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invitations.map((inv) => (
                    <tr key={inv.invitation_id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">
                        <div>{inv.candidate_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{inv.candidate_email}</div>
                      </td>
                      <td className="p-4 text-slate-200">{inv.job_title}</td>
                      <td className="p-4">
                        <span className="font-extrabold text-blue-400 text-base">{inv.match_score}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          inv.status === 'interested' || inv.status === 'interview_scheduled'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inv.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(inv.sent_at).toLocaleString()}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {inv.responded_at ? new Date(inv.responded_at).toLocaleString() : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AI MATCH RESULTS */}
        {activeTab === 'matches' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">AI Score</th>
                    <th className="p-4">Matching Skills</th>
                    <th className="p-4">Skill Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchResults.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">{m.candidate_name}</td>
                      <td className="p-4 text-slate-200">{m.job_title}</td>
                      <td className="p-4">
                        <span className="text-lg font-black text-emerald-400">{m.match_score}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {m.matching_skills?.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {m.skill_gap?.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-red-950/40 text-red-300 border border-red-900/40">
                              ✗ {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
