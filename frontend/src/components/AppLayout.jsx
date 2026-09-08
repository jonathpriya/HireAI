import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { 
  Menu, X, Bell, Zap, User, Sparkles, Plus
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
    if (path.includes('/job-invitations')) return 'Job Invitations';
    if (path.includes('/notifications')) return 'Activity Notifications';
    if (path.includes('/profile')) return 'Profile & Availability';
    if (path.includes('/settings')) return 'Account Preferences';
    return 'Portal';
  };

  const profilePhotoUrl = user ? getFullImageUrl(user.profile_pic_url) : null;

  return (
    <div className="min-h-screen bg-transparent flex text-zinc-900 antialiased">
      
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        
        {/* Top Minimal App Header */}
        <header className="sticky top-0 z-30 h-14 bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white lg:hidden transition"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">{getPageTitle()}</h2>
            </div>
          </div>

          {/* Right: Quick Actions, Credits, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Primary Action Button (e.g. Post Job for Recruiter) */}
            {user?.role === 'recruiter' && !location.pathname.includes('/post-job') && (
              <Link
                to="/recruiter/post-job"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Job</span>
              </Link>
            )}

            {/* Credits Counter Pill */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-white">{user?.credits ?? 0}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase hidden sm:inline">Credits</span>
            </div>

            {/* Notifications Bell */}
            <Link
              to={user?.role === 'candidate' ? '/candidate/notifications' : '/recruiter/pipeline'}
              className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition relative shadow-sm"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </Link>

            {/* Quick Profile Avatar */}
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile'}
              className="flex items-center gap-2 pl-2 border-l border-slate-800 group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-white font-semibold text-xs transition group-hover:border-slate-500">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>

      </div>

    </div>
  );
}
