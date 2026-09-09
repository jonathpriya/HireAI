import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsModal from './CreditsModal';
import API from '../services/api';
import { 
  Briefcase, LogOut, LayoutDashboard, 
  MessageSquare, Bookmark, Zap, Menu, X,
  User, ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [userCredits, setUserCredits] = useState(user?.credits || 0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

        {/* Desktop / Laptop Navigation Links */}
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

        {/* Desktop / Laptop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs font-medium transition hover:bg-slate-800/60"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
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

        {/* Mobile Hamburger Button (Phones & Small Tablets) */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <button
              onClick={() => setShowCreditsModal(true)}
              className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>{userCredits}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090d16]/98 backdrop-blur-xl border-b border-slate-800/90 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl">
          {!user ? (
            <>
              <div className="space-y-1 text-sm font-medium text-slate-300">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition"
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition"
                >
                  Services
                </Link>
                <Link
                  to="/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-blue-400" /> Careers
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition"
                >
                  Contact
                </Link>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-slate-700 text-center text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-center text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{user.full_name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user.role} workspace</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>{userCredits} credits</span>
                </div>
              </div>

              <div className="space-y-1 text-sm font-medium text-slate-300">
                <Link
                  to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                </Link>

                <Link
                  to="/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-blue-400" /> Careers
                </Link>

                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-white transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Messages</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showCreditsModal && (
        <CreditsModal onClose={() => setShowCreditsModal(false)} />
      )}
    </header>
  );
}
