import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsModal from './CreditsModal';
import API from '../services/api';
import { 
  Sparkles, Briefcase, UserCheck, Bell, LogOut, LayoutDashboard, 
  MessageSquare, Bookmark, Zap, User 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [userCredits, setUserCredits] = useState(user?.credits || 0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setUserCredits(user.credits || 0);
      API.get('/credits/balance')
        .then((res) => setUserCredits(res.data.credits))
        .catch((err) => console.error("Failed to fetch navbar credits", err));

      API.get('/messages/unread-count')
        .then((res) => setUnreadCount(res.data.unread_count))
        .catch((err) => console.error("Failed to fetch unread count", err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl text-slate-900 tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span>Hire<span className="gradient-text">AI</span></span>
        </Link>

        {/* Dynamic Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600">
          {!user ? (
            <>
              <Link to="/" className="hover:text-blue-600 transition">Home</Link>
              <Link to="/about" className="hover:text-blue-600 transition">About</Link>
              <Link to="/services" className="hover:text-blue-600 transition">Services</Link>
              <Link to="/career" className="hover:text-blue-600 transition flex items-center gap-1 font-extrabold text-blue-600">
                <Briefcase className="w-3.5 h-3.5" /> Explore Jobs
              </Link>
              <Link to="/contact" className="hover:text-blue-600 transition">Contact</Link>
            </>
          ) : (
            <>
              <Link to="/career" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Explore Jobs
              </Link>

              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="hover:text-blue-600 transition flex items-center gap-1 text-blue-700">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link to="/recruiter/talent-pools" className="hover:text-purple-600 transition flex items-center gap-1 text-slate-700">
                    <Bookmark className="w-3.5 h-3.5 text-purple-600" /> Talent Pools
                  </Link>
                </>
              )}

              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="hover:text-blue-600 transition flex items-center gap-1 text-blue-700">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
              )}

              {/* Direct InMail Messages Tab with Live Unread Counter */}
              <Link
                to="/messages"
                className="relative px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-extrabold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black text-[9px] shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition hover:scale-105">
                Join HireAI
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreditsModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
                title="View Credits"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{userCredits} Credits</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {showCreditsModal && (
        <CreditsModal onClose={() => setShowCreditsModal(false)} />
      )}
    </header>
  );
}
