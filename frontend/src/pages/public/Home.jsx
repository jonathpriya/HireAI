import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, LogIn, Mail, ShieldCheck 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 text-white overflow-hidden flex flex-col justify-center py-12 sm:py-20">
      
      {/* ─── Relevant AI HR Tech Background Image with Dark Overlay ─────────── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 pointer-events-none transition-transform duration-1000"
        style={{ backgroundImage: `url('/images/hero_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Decorative Ambient Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 text-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-blue-400 text-xs font-black uppercase tracking-widest shadow-xl">
          <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          <span>Next-Gen Autonomous AI Recruitment Platform</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto text-white uppercase">
          Automate Recruitment. <br />
          <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Cultivate Top Talent.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Create meaningful candidate &amp; recruiter connections across every skill matrix with custom-built AI SaaS solutions — parsing resumes, ranking 0–100% fit scores, and cascading automated invitations.
        </p>

        {/* Single Action Button Group: GET STARTED & CONTACT US */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
          >
            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto px-10 py-4.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5 text-blue-400" />
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Trust Indicators Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <p className="text-2xl font-black text-blue-400">98.5%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Skill Match Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <p className="text-2xl font-black text-purple-400">10x</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Faster Shortlisting</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <p className="text-2xl font-black text-cyan-400">0.01s</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NLP Vector Engine</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <p className="text-2xl font-black text-emerald-400">100%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate Verified</p>
          </div>
        </div>

      </div>

    </div>
  );
}
