import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-transparent text-white overflow-hidden flex flex-col justify-center py-16 sm:py-24">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
        
        {/* Floating Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-blue-300 text-xs font-semibold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Next-Gen Autonomous AI Recruitment</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.12]">
          Automate recruitment. <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Hire top candidates faster.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Connect qualified candidates with leading companies using intelligent resume parsing, 0–100% skill matching, and automated candidate workflows.
        </p>

        {/* Primary Action Button */}
        <div className="flex items-center justify-center pt-2">
          <Link
            to="/login"
            className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 group hover:scale-[1.02]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Micro Trust Indicators */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>AI Resume Parsing</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>0–100% Fit Scoring</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Automated Invitations</span>
          </div>
        </div>

      </div>

    </div>
  );
}
