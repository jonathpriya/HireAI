import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, LayoutDashboard, Briefcase, PlusCircle, Users, GitMerge, 
  Globe, Building2, Settings, User, FileText, Mail, Bell, ShieldCheck, 
  LogOut, Search, Zap
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
        { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/recruiter/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
        { to: '/recruiter/post-job', label: 'Post New Job', icon: PlusCircle },
        { to: '/recruiter/pipeline', label: 'ATS Pipeline', icon: GitMerge },
        { to: '/recruiter/sourcing', label: 'Boolean Sourcing', icon: Users },
        { to: '/recruiter/integrations', label: 'Job Boards & Sync', icon: Globe },
        { to: '/recruiter/profile', label: 'Company Profile', icon: Building2 },
        { to: '/recruiter/settings', label: 'Settings', icon: Settings }
      ];
    } else if (user.role === 'candidate') {
      return [
        { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/candidate/jobs', label: 'Explore Jobs', icon: Search },
        { to: '/candidate/resume-upload', label: 'Resume Center', icon: FileText },
        { to: '/candidate/job-invitations', label: 'Job Invitations', icon: Mail },
        { to: '/candidate/notifications', label: 'Notifications', icon: Bell },
        { to: '/candidate/profile', label: 'My Profile', icon: User },
        { to: '/candidate/settings', label: 'Settings', icon: Settings }
      ];
    } else if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck }
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
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Surface */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090d16]/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-4 border-b border-slate-800/80">
          <NavLink 
            to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">HireAI</span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-[10px] uppercase">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium capitalize block">
                {user.role === 'recruiter' ? 'Recruiter Space' : user.role === 'candidate' ? 'Candidate Space' : 'Admin Hub'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Middle Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.full_name || 'User'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400 capitalize">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] font-medium text-amber-400 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-400" /> {user.credits ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
