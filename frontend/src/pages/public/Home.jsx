import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Cpu, Zap, ShieldCheck, ArrowRight, LogIn, 
  CheckCircle2, FileText, Users, Award, TrendingUp 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* ─── Main Hero Viewport Card ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50 to-blue-50/40 border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-12 text-center space-y-8">
        
        {/* Decorative Ambient Background Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Autonomous AI Resume Parsing &amp; Candidate Cascading Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Stop Searching Resumes Manually. <br />
          Hire <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Top Interested Candidates</span> Automatically.
        </h1>

        {/* Concise Description */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          HireAI automatically parses job descriptions, ranks candidate fit scores with NLP vector matching, sends automated invitations, and cascades when candidates decline.
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

        {/* ─── Compact Live Statistics Bar ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 max-w-3xl mx-auto">
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-600">98.5%</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Skill Match Accuracy</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-purple-600">10x</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Faster Hiring Time</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">0%</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Uninterested Applicant Noise</p>
          </div>
        </div>

      </div>

      {/* ─── 4-Step Interactive Workflow Bar ───────────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">How HireAI Autonomous Workflow Operates</h2>
          <p className="text-slate-500 text-xs font-medium">Four simple steps from posting a job to hiring pre-vetted interested candidates.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-blue-50/50 hover:border-blue-200 transition group">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform">1</div>
            <p className="font-extrabold text-slate-900 text-sm">Post Job &amp; Skills</p>
            <p className="text-[11px] text-slate-500 leading-snug font-medium">Recruiter uploads JD with required skill set.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-purple-50/50 hover:border-purple-200 transition group">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform">2</div>
            <p className="font-extrabold text-slate-900 text-sm">AI Vector Match</p>
            <p className="text-[11px] text-slate-500 leading-snug font-medium">NLP engine computes 0–100% resume match scores.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-indigo-50/50 hover:border-indigo-200 transition group">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform">3</div>
            <p className="font-extrabold text-slate-900 text-sm">Cascade Invitations</p>
            <p className="text-[11px] text-slate-500 leading-snug font-medium">System invites top matches &amp; auto-cascades if declined.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-emerald-50/50 hover:border-emerald-200 transition group">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform">4</div>
            <p className="font-extrabold text-slate-900 text-sm">Interested Shortlist</p>
            <p className="text-[11px] text-slate-500 leading-snug font-medium">Recruiters receive a list of 100% interested applicants.</p>
          </div>
        </div>
      </div>

      {/* ─── Compact 3-Column Core Highlights ──────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">NLP Resume Parsing</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Extract candidate experience, education, and technical skill matrices instantly from PDF and DOCX files.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">AI Cosine Similarity</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            TF-IDF vector matching ranks job candidates objectively based on skill overlap and career experience.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Direct InMail &amp; Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Corporate work email verification, direct recruiter candidate messaging, and automated email alerts.
          </p>
        </div>
      </div>

    </div>
  );
}
