import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-[#fafafa] text-zinc-900 overflow-hidden flex flex-col justify-center py-16 sm:py-24">
      
      {/* Subtle Ambient Grid Background */}
      <div className="absolute inset-0 bg-ambient-mesh pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
        
        {/* Floating Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/90 text-zinc-700 text-xs font-medium shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Next-Gen Autonomous AI Recruitment</span>
        </div>

        {/* High-Impact Linear/Vercel Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.12]">
          Automate recruitment. <br />
          <span className="text-zinc-400">Hire top candidates faster.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed font-normal">
          Connect qualified candidates with leading companies using intelligent resume parsing, 0–100% skill matching, and automated candidate workflows.
        </p>

        {/* Primary Action Button */}
        <div className="flex items-center justify-center pt-2">
          <Link
            to="/login"
            className="px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Micro Trust Indicators */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Resume Parsing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>0–100% Fit Scoring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Automated Invitations</span>
          </div>
        </div>

      </div>

    </div>
  );
}
