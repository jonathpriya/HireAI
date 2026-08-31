import React from 'react';
import { 
  FileText, Cpu, RefreshCw, MessageSquare, ShieldCheck, UserCheck, 
  Sparkles, CheckCircle2, Zap, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const servicesList = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200",
      title: "AI Resume & JD Parsing",
      description: "Automatic parsing of skills, experience, and qualification criteria from PDF and DOCX files using intelligent NLP text extraction."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50 border-purple-200",
      title: "0–100% AI Skill Matching Engine",
      description: "Objective candidate ranking combining TF-IDF vector similarity and structured skill matrix overlap for accurate fit scoring."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200",
      title: "Automated Shortlist Cascading",
      description: "When a candidate declines an invitation, the system automatically dispatches an invite to the next best match candidate."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200",
      title: "Direct InMail Messaging System",
      description: "Direct real-time messaging between recruiters and pre-vetted candidates with instant unread notification badges."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      bg: "bg-indigo-50 border-indigo-200",
      title: "Corporate Email & Talent Pools",
      description: "Recruiter corporate email domain verification, custom candidate talent pool management, and AI credit top-ups."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-rose-600" />,
      bg: "bg-rose-50 border-rose-200",
      title: "Candidate Career Portal",
      description: "Dedicated dashboard for candidates to upload resumes, view automated 75%+ job match invitations, and respond in 1 click."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Full-Spectrum Recruitment Automation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Our Complete <span className="gradient-text">Services &amp; Solutions</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">
          HireAI provides end-to-end intelligent recruitment services designed to automate hiring, eliminate resume noise, and connect interested candidates with recruiters.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {servicesList.map((service, index) => (
          <div key={index} className="glass-card p-7 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-2xl border ${service.bg} flex items-center justify-center`}>
              {service.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 space-y-6 text-center">
        <h2 className="text-2xl font-black tracking-tight">Ready to Streamline Your Hiring Process?</h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          Experience AI-driven matching, automated invitations, and direct candidate engagement.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-extrabold text-xs text-white shadow-lg transition"
        >
          Get Started / Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
