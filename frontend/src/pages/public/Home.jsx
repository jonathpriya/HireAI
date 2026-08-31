import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, LogIn, Mail, ShieldCheck, Cpu, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 overflow-hidden flex flex-col justify-center py-12 sm:py-20">
      
      {/* Light Background Decorative Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 text-center">
        
        {/* Floating Light Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-blue-700 text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Next-Gen Autonomous AI Recruitment Platform</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto text-slate-900 uppercase">
          Automate Recruitment. <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hire Top Candidates.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          Create meaningful candidate &amp; recruiter connections with custom-built AI solutions — parsing resumes, ranking 0–100% fit scores, and cascading automated job invitations.
        </p>

        {/* Single Action Button Group: GET STARTED & CONTACT US */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
          >
            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-white border border-slate-300 hover:border-blue-600 text-slate-800 hover:text-blue-600 font-black text-sm uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Clean Light Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <p className="text-2xl font-black text-blue-600">98.5%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Skill Match Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <p className="text-2xl font-black text-purple-600">10x</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Faster Shortlisting</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <p className="text-2xl font-black text-indigo-600">0.01s</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">NLP Vector Engine</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <p className="text-2xl font-black text-emerald-600">100%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Corporate Verified</p>
          </div>
        </div>

      </div>

    </div>
  );
}
