import React from 'react';
import { Target, Users, Zap, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">About <span className="gradient-text">HireAI Platform</span></h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">Bridging the gap between talented job seekers and recruiters through modern artificial intelligence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            Recruitment traditionally involves spending dozens of hours manually scanning through hundreds of irrelevant resumes. HireAI simplifies and automates candidate shortlisting using AI match scores and candidate response verification.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Zero-Friction Shortlisting</h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            By contacting candidates before forwarding their details to recruiters, we ensure that recruiters only spend their valuable time evaluating pre-verified, interested candidates.
          </p>
        </div>
      </div>
    </div>
  );
}
