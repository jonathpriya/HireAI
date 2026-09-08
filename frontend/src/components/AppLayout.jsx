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
    if (path.includes('/job-invitations')) return 'Interview Invitations';
    if (path.includes('/notifications')) return 'Activity Notifications';
    if (path.includes('/profile')) return 'Profile & Availability';
    if (path.includes('/settings')) return 'Account Preferences';
    return 'Portal';
  };

  const profilePhotoUrl = user ? getFullImageUrl(user.profile_pic_url) : null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-zinc-900 antialiased">
      
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        
        {/* Top Minimal App Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 lg:hidden transition"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">{getPageTitle()}</h2>
            </div>
          </div>

          {/* Right: Quick Actions, Credits, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Primary Action Button (e.g. Post Job for Recruiter) */}
            {user?.role === 'recruiter' && !location.pathname.includes('/post-job') && (
              <Link
                to="/recruiter/post-job"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-subtle transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Job</span>
              </Link>
            )}

            {/* Credits Counter Pill */}
            <div className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 flex items-center gap-1.5 shadow-subtle">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-zinc-900">{user?.credits ?? 0}</span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase hidden sm:inline">Credits</span>
            </div>

            {/* Notifications Bell */}
            <Link
              to={user?.role === 'candidate' ? '/candidate/notifications' : '/recruiter/pipeline'}
              className="p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition relative shadow-subtle"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </Link>

            {/* Quick Profile Avatar */}
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile'}
              className="flex items-center gap-2 pl-2 border-l border-zinc-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-zinc-800 font-semibold text-xs transition group-hover:border-zinc-400">
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
