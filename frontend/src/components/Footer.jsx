import React from 'react';
import { Sparkles, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        
        {/* Logo & Brand Name */}
        <Link to="/" className="flex items-center gap-2 font-black text-lg text-slate-900 tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>Hire<span className="gradient-text">AI</span></span>
        </Link>

        {/* Support Email Link */}
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-4 h-4 text-blue-600" />
          <span>Support: <strong className="text-slate-800">devilqueen2547@gmail.com</strong></span>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} HireAI Platform. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
