import React from 'react';
import { Sparkles, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          
          {/* Brand Logo & Motto */}
          <div className="space-y-1.5 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 font-black text-xl text-slate-900 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Hire<span className="gradient-text">AI</span></span>
            </Link>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              <strong>Motto:</strong> "Hire Top Interested Candidates Automatically — Zero Resume Noise, Maximum Fit."
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-700">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <Link to="/career" className="hover:text-blue-600 transition">Careers</Link>
            <Link to="/services" className="hover:text-blue-600 transition">Services</Link>
            <Link to="/about" className="hover:text-blue-600 transition">About Us</Link>
            <Link to="/contact" className="hover:text-blue-600 transition">Contact Support</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Support: <strong className="text-slate-800">devilqueen2547@gmail.com</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>&copy; {new Date().getFullYear()} HireAI Platform. All rights reserved.</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure &amp; Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
