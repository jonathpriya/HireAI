import React from 'react';
import { Sparkles, Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          
          {/* Brand Logo & Motto */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 font-black text-2xl text-white tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>Hire<span className="text-blue-400">AI</span></span>
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              <strong>Motto:</strong> "Hire Top Interested Candidates Automatically — Zero Resume Noise, Maximum Fit."
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300">
            <Link to="/" className="hover:text-blue-400 transition">Home</Link>
            <Link to="/career" className="hover:text-blue-400 transition">Careers</Link>
            <Link to="/services" className="hover:text-blue-400 transition">Services</Link>
            <Link to="/about" className="hover:text-blue-400 transition">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact Support</Link>
            <Link to="/login" className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition">
              Login Portal
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2 text-slate-400">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Support: <strong className="text-slate-200">devilqueen2547@gmail.com</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>&copy; {new Date().getFullYear()} HireAI Platform. All rights reserved.</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure &amp; Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
