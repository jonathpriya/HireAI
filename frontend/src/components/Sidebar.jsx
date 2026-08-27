import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, LayoutDashboard, Briefcase, PlusCircle, Users, GitMerge, 
  Globe, Building2, Settings, User, FileText, Mail, Bell, ShieldCheck, 
  LogOut, ChevronRight, Zap, Award, Layers, Search
} from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUrl';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user.role === 'recruiter') {
      return [
        { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600', activeBg: 'bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600 shadow-sm' },
        { to: '/recruiter/manage-jobs', label: 'Manage Jobs', icon: Briefcase, color: 'text-sky-600', activeBg: 'bg-sky-50 text-sky-700 font-extrabold border-l-4 border-sky-600 shadow-sm' },
        { to: '/recruiter/post-job', label: 'Post New Job', icon: PlusCircle, color: 'text-emerald-600', activeBg: 'bg-emerald-50 text-emerald-700 font-extrabold border-l-4 border-emerald-600 shadow-sm' },
        { to: '/recruiter/pipeline', label: 'ATS Pipeline', icon: GitMerge, color: 'text-indigo-600', activeBg: 'bg-indigo-50 text-indigo-700 font-extrabold border-l-4 border-indigo-600 shadow-sm' },
        { to: '/recruiter/sourcing', label: 'Boolean Sourcing', icon: Users, color: 'text-purple-600', activeBg: 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 shadow-sm' },
        { to: '/recruiter/integrations', label: 'Job Boards & Sync', icon: Globe, color: 'text-amber-600', activeBg: 'bg-amber-50 text-amber-700 font-extrabold border-l-4 border-amber-600 shadow-sm' },
        { to: '/recruiter/profile', label: 'Company Profile', icon: Building2, color: 'text-cyan-600', activeBg: 'bg-cyan-50 text-cyan-700 font-extrabold border-l-4 border-cyan-600 shadow-sm' },
        { to: '/recruiter/settings', label: 'Settings', icon: Settings, color: 'text-slate-600', activeBg: 'bg-slate-100 text-slate-900 font-extrabold border-l-4 border-slate-700 shadow-sm' }
      ];
    } else if (user.role === 'candidate') {
      return [
        { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600', activeBg: 'bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600 shadow-sm' },
        { to: '/candidate/jobs', label: 'Explore Jobs', icon: Search, color: 'text-emerald-600', activeBg: 'bg-emerald-50 text-emerald-700 font-extrabold border-l-4 border-emerald-600 shadow-sm' },
        { to: '/candidate/resume-upload', label: 'Resume Center', icon: FileText, color: 'text-cyan-600', activeBg: 'bg-cyan-50 text-cyan-700 font-extrabold border-l-4 border-cyan-600 shadow-sm' },
        { to: '/candidate/job-invitations', label: 'Job Invitations', icon: Mail, color: 'text-purple-600', activeBg: 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 shadow-sm' },
        { to: '/candidate/notifications', label: 'Notifications', icon: Bell, color: 'text-amber-600', activeBg: 'bg-amber-50 text-amber-700 font-extrabold border-l-4 border-amber-600 shadow-sm' },
        { to: '/candidate/profile', label: 'My Profile', icon: User, color: 'text-pink-600', activeBg: 'bg-pink-50 text-pink-700 font-extrabold border-l-4 border-pink-600 shadow-sm' },
        { to: '/candidate/settings', label: 'Settings', icon: Settings, color: 'text-slate-600', activeBg: 'bg-slate-100 text-slate-900 font-extrabold border-l-4 border-slate-700 shadow-sm' }
      ];
    } else if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck, color: 'text-rose-600', activeBg: 'bg-rose-50 text-rose-700 font-extrabold border-l-4 border-rose-600 shadow-sm' }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();
  const profilePhotoUrl = getFullImageUrl(user.profile_pic_url);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Surface */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-100">
          <NavLink 
            to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">Hire<span className="gradient-text">AI</span></span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 font-black text-[9px] uppercase">PRO</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                {user.role === 'recruiter' ? 'Recruiter Hub' : user.role === 'candidate' ? 'Candidate Space' : 'Admin Hub'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Middle Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Menu
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? item.activeBg
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-slate-200'} transition`}>
                      <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-700'}`} />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.full_name || 'User'}</p>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                    {user.role}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" /> {user.credits ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
