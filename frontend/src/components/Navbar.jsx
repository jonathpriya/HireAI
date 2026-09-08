import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsModal from './CreditsModal';
import API from '../services/api';
import { 
  Briefcase, LogOut, LayoutDashboard, 
  MessageSquare, Bookmark, Zap
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
    <header className="sticky top-0 z-50 bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="HireAI Logo" className="h-9 w-auto object-contain transition-transform hover:opacity-90" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          {!user ? (
            <>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/services" className="hover:text-white transition-colors">Services</Link>
              <Link to="/career" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-white">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Careers
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link to="/career" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-white">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Careers
              </Link>

              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" /> Dashboard
                  </Link>
                  <Link to="/recruiter/talent-pools" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" /> Talent Pools
                  </Link>
                </>
              )}

              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" /> Dashboard
                </Link>
              )}

              <Link
                to="/messages"
                className="relative px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition border border-slate-700/60"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreditsModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-slate-800"
                title="View Credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{userCredits} Credits</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-medium transition flex items-center gap-1"
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
