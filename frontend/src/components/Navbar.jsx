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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="HireAI Logo" className="h-9 w-auto object-contain transition-transform hover:opacity-90" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600">
          {!user ? (
            <>
              <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
              <Link to="/services" className="hover:text-zinc-900 transition-colors">Services</Link>
              <Link to="/career" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5 font-semibold text-zinc-900">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Careers
              </Link>
              <Link to="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
            </>
          ) : (
            <>
              <Link to="/career" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5 font-semibold text-zinc-900">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Careers
              </Link>

              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link to="/recruiter/talent-pools" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" /> Talent Pools
                  </Link>
                </>
              )}

              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
              )}

              <Link
                to="/messages"
                className="relative px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
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
                className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-zinc-100"
                title="View Credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{userCredits} Credits</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-xs font-medium transition flex items-center gap-1"
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
