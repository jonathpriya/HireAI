import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsModal from './CreditsModal';
import API from '../services/api';
import { 
  Sparkles, Briefcase, LogOut, LayoutDashboard, 
  MessageSquare, Bookmark, Zap, User, LogIn 
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
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="HireAI Logo" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          {!user ? (
            <>
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
              <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
              <Link to="/career" className="hover:text-blue-600 transition-colors text-blue-600 font-extrabold flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Careers
              </Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link to="/career" className="hover:text-blue-600 transition-colors text-blue-600 font-bold flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Careers
              </Link>

              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="hover:text-blue-600 transition-colors text-blue-700 font-bold flex items-center gap-1">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link to="/recruiter/talent-pools" className="hover:text-purple-600 transition-colors text-slate-700 font-bold flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-purple-600" /> Talent Pools
                  </Link>
                </>
              )}

              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="hover:text-blue-600 transition-colors text-blue-700 font-bold flex items-center gap-1">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
              )}

              <Link
                to="/messages"
                className="relative px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-extrabold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black text-[9px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Single Action Button: LOGIN ONLY */}
        <div className="flex items-center gap-3">
          {!user ? (
            <Link 
              to="/login" 
              className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreditsModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
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
