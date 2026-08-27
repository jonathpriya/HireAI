import React from 'react';
import { Briefcase, UserCheck, FileText, Bot, RefreshCw, BarChart } from 'lucide-react';

export default function Services() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Platform <span className="gradient-text">Services</span></h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">Comprehensive tools built for recruiters and job seekers.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Resume Text Extraction</h3>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">Automatic parsing of skills, experience, and education from PDF &amp; DOCX resumes.</p>
        </div>

        <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Matching Engine</h3>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">TF-IDF Vectorization and Cosine Similarity to calculate exact 0-100% fit scores.</p>
        </div>

        <div className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Cascade Auto-Matching</h3>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">Automated re-invitation of candidate #11 when candidate #1 declines an invitation.</p>
        </div>
      </div>
    </div>
  );
}
