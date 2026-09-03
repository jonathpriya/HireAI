import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, LogIn, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 overflow-hidden flex flex-col justify-center py-12 sm:py-20">
      
      {/* Light Background Decorative Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
        
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

        {/* Primary Action Button: GET STARTED */}
        <div className="flex items-center justify-center pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
}
