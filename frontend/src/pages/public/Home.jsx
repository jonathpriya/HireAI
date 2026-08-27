import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Cpu, UserCheck, Zap, ShieldCheck, ArrowRight, CheckCircle2, Award, Briefcase } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI-Driven Resume Matching &amp; Candidate Engagement Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Stop Searching Resumes Manually. <br />
            Hire <span className="gradient-text">Top Interested Candidates</span> Automatically.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Our platform automatically parses job descriptions, calculates AI match scores against candidate resumes, sends automated invitations, and cascades when candidates decline — presenting recruiters with a pre-vetted list of interested applicants.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register?role=recruiter"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              Recruiter Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register?role=candidate"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-extrabold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm"
            >
              Candidate Portal <UserCheck className="w-4 h-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">How HireAI Revolutionizes Recruitment</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">End-to-end intelligent automation for recruiters and job seekers alike.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Resume &amp; JD Parsing</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Extract skills, experience, and qualification criteria instantly from uploaded PDF and DOCX files using our built-in NLP engine.
            </p>
          </div>

          <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">0–100% AI Matching Score</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              TF-IDF Cosine similarity combined with structured skill matrix overlap ranks candidates objectively based on true fit.
            </p>
          </div>

          <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Cascade Invitations</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              When a candidate declines, our system automatically dispatches invitations to the next best match candidate to keep shortlists filled.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Diagram Preview */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-200 text-center space-y-8 bg-white shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Automated Recruitment Workflow</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">1</span>
              <p className="font-bold text-slate-900 text-sm">Post Job / JD</p>
              <p className="text-xs text-slate-500 font-medium">Recruiter uploads JD with required skills.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">2</span>
              <p className="font-bold text-slate-900 text-sm">AI Skill Match</p>
              <p className="text-xs text-slate-500 font-medium">NLP engine calculates candidate scores.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">3</span>
              <p className="font-bold text-slate-900 text-sm">Candidate Invite</p>
              <p className="text-xs text-slate-500 font-medium">Top matches accept or reject invite.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">4</span>
              <p className="font-bold text-slate-900 text-sm">Shortlist Delivered</p>
              <p className="text-xs text-slate-500 font-medium">Recruiter gets interested candidate list.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
