import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, PhoneCall, UserPlus } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      const pendingJobId = sessionStorage.getItem('pendingJobId');
      const params = new URLSearchParams(routerLocation.search);
      const jobIdParam = params.get('job_id') || pendingJobId;

      if (data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'candidate') {
        if (jobIdParam) {
          sessionStorage.removeItem('pendingJobId');
          navigate(`/career?job_id=${jobIdParam}`);
        } else {
          navigate('/candidate/dashboard');
        }
      } else {
        navigate('/');
      }

    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure Python uvicorn server is running on http://127.0.0.1:8000');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-4 py-12 space-y-6">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl space-y-6 bg-white border border-slate-200 shadow-xl">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-3">
          <img src="/images/logo.png" alt="HireAI Logo" className="h-16 w-auto mx-auto object-contain" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Login Portal</h1>
          <p className="text-xs text-slate-500 font-medium">Enter your credentials to access your HireAI portal</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="login-email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or phone number"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotSuccess(false); setForgotPhone(''); }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* New User Sign Up Section */}
        <div className="pt-2 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500 font-medium">New to HireAI?</p>
          <Link
            to="/register"
            className="w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> New User? Create an Account / Sign Up
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-600" /> Reset Password
            </h3>
            
            {forgotSuccess ? (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Password reset OTP link has been dispatched to phone number: <strong>{forgotPhone}</strong> and your registered email!
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Enter your registered Phone Number or Email to receive a 6-digit reset code.
                </p>
                <div>
                  <label htmlFor="forgot-phone" className="block text-xs font-bold text-slate-700 mb-1">Phone Number or Email</label>
                  <input
                    id="forgot-phone"
                    name="phone"
                    required
                    type="text"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="+1234567890 or user@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                  >
                    Send OTP Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
