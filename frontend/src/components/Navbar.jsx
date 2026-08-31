import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsModal from './CreditsModal';
import API from '../services/api';
import { 
  Sparkles, Briefcase, LogOut, LayoutDashboard, 
  MessageSquare, Bookmark, Zap, User, LogIn, ArrowRight 
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 font-black text-2xl text-white tracking-wider">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="uppercase tracking-widest font-extrabold">Hire<span className="text-pink-500">AI</span></span>
        </Link>

        {/* Navigation Links - Uppercase & Bold */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-300">
          {!user ? (
            <>
              <Link to="/" className="hover:text-pink-400 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-pink-400 transition-colors">About</Link>
              <Link to="/services" className="hover:text-pink-400 transition-colors">Services</Link>
              <Link to="/career" className="hover:text-pink-400 transition-colors text-cyan-400">Careers</Link>
              <Link to="/contact" className="hover:text-pink-400 transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link to="/career" className="hover:text-pink-400 transition-colors text-cyan-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Careers
              </Link>

              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="hover:text-pink-400 transition-colors text-pink-400 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/recruiter/talent-pools" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-purple-400" /> Talent Pools
                  </Link>
                </>
              )}

              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="hover:text-pink-400 transition-colors text-pink-400 flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}

              <Link
                to="/messages"
                className="relative px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-black text-[9px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Dual Action Buttons (LOGIN & LET'S CONNECT) */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border border-slate-700 hover:border-pink-500 text-white hover:text-pink-400 transition-all"
              >
                Login
              </Link>
              <Link 
                to="/contact" 
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:scale-105 flex items-center gap-1"
              >
                Let's Connect <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreditsModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
                title="View Credits"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{userCredits} Credits</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
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
