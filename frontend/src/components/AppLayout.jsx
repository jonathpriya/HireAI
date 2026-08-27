import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { 
  Menu, X, Bell, Zap, Search, User, Sparkles, LogOut, 
  ChevronRight, ArrowUpRight, ShieldCheck, Briefcase, Plus
} from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUrl';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/manage-jobs')) return 'Manage Job Openings';
    if (path.includes('/post-job')) return 'Create Job Opening';
    if (path.includes('/pipeline')) return 'ATS Hiring Pipeline';
    if (path.includes('/sourcing')) return 'Boolean Talent Sourcing';
    if (path.includes('/integrations')) return 'Job Board Integrations Hub';
    if (path.includes('/candidate/jobs')) return 'Explore Job Matches';
    if (path.includes('/resume-upload')) return 'Resume & Skill Extractor';
    if (path.includes('/job-invitations')) return 'Interview Invitations';
    if (path.includes('/notifications')) return 'Activity Notifications';
    if (path.includes('/profile')) return 'Profile & Availability';
    if (path.includes('/settings')) return 'Account Preferences';
    return 'Portal';
  };

  const profilePhotoUrl = user ? getFullImageUrl(user.profile_pic_url) : null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex text-slate-800">
      
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        
        {/* Top Minimal App Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 lg:hidden transition"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h2>
            </div>
          </div>

          {/* Right: Quick Actions, Credits, Notifications, User */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Primary Action Button (e.g. Post Job for Recruiter) */}
            {user?.role === 'recruiter' && !location.pathname.includes('/post-job') && (
              <Link
                to="/recruiter/post-job"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Job</span>
              </Link>
            )}

            {/* Credits Counter Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-black text-slate-900">{user?.credits ?? 0}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">Credits</span>
            </div>

            {/* Notifications Bell */}
            <Link
              to={user?.role === 'candidate' ? '/candidate/notifications' : '/recruiter/pipeline'}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
            </Link>

            {/* Quick Profile Avatar */}
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile'}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm group-hover:ring-2 ring-blue-500/30 transition">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
            </Link>

          </div>

        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>

      </div>

    </div>
  );
}
