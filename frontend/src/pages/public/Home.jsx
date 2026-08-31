import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Cpu, Zap, ShieldCheck, ArrowRight, LogIn, 
  CheckCircle2, FileText, Users, Award, TrendingUp,
  Briefcase, UserCheck, Check
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('recruiter');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* ─── Main Hero Viewport Card ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50 to-blue-50/40 border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-12 text-center space-y-8">
        
        {/* Decorative Ambient Background Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Operational Status & Motto Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI Platform Status: 100% Online &amp; Operational</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm text-xs font-bold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Motto: Hire Top Interested Candidates Automatically</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Stop Searching Resumes Manually. <br />
          Hire <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Top Interested Candidates</span> Automatically.
        </h1>

        {/* Brand Slogan */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          "Zero Resume Noise. Maximum Candidate Fit. Intelligent NLP Vector Matching &amp; Automated Shortlist Cascading."
        </p>

        {/* Single Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
          >
            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Login / Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ─── Compact Trust Badges ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-extrabold text-slate-600 pt-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Corporate Work Email Verified
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> 0.01s Instant NLP Match Engine
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Pre-Vetted Applicants
          </span>
        </div>

        {/* ─── Compact Live Statistics Bar ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-600">98.5%</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Skill Match Accuracy</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-purple-600">10x</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Faster Hiring Speed</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">0%</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Uninterested Resume Noise</p>
          </div>
        </div>

      </div>

      {/* ─── Interactive Switchable Portal Preview ────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">How HireAI Solves Recruitment</h2>
          <p className="text-slate-500 text-xs font-medium">Select a role below to preview how our intelligent matching system works.</p>

          {/* Interactive Role Toggle */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-1.5 mt-2">
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'recruiter' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> For Recruiters
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'candidate' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> For Candidates
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'recruiter' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Post JD &amp; Required Skills</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">Upload job description and define core skill requirements.</p>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-900 text-sm">Automated Vector Ranking</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">NLP engine calculates 0–100% match scores across resumes.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</span>
              <h3 className="font-bold text-slate-900 text-sm">Get Interested Applicants</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">Receive pre-vetted list of candidates who accepted invitations.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Upload Resume (PDF/DOCX)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">AI parses your skills, experience, and domain expertise.</p>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-900 text-sm">Get 75%+ Auto Job Invites</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">Receive high-matching job invitations from corporate recruiters.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</span>
              <h3 className="font-bold text-slate-900 text-sm">Accept or Decline in 1-Click</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">Direct InMail messaging with recruiters upon accepting invite.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
