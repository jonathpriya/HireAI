import React from 'react';
import { 
  FileText, Cpu, RefreshCw, MessageSquare, ShieldCheck, UserCheck, 
  Sparkles, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const servicesList = [
    {
      icon: <FileText className="w-6 h-6 text-pink-400" />,
      border: "border-pink-500/30 bg-pink-950/20",
      title: "AI Resume & JD Parsing",
      description: "Automatic parsing of skills, experience, and qualification criteria from PDF and DOCX files using intelligent NLP text extraction."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      border: "border-purple-500/30 bg-purple-950/20",
      title: "0–100% AI Skill Matching Engine",
      description: "Objective candidate ranking combining TF-IDF vector similarity and structured skill matrix overlap for accurate fit scoring."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-cyan-400" />,
      border: "border-cyan-500/30 bg-cyan-950/20",
      title: "Automated Shortlist Cascading",
      description: "When a candidate declines an invitation, the system automatically dispatches an invite to the next best match candidate."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-amber-400" />,
      border: "border-amber-500/30 bg-amber-950/20",
      title: "Direct InMail Messaging System",
      description: "Direct real-time messaging between recruiters and pre-vetted candidates with instant unread notification badges."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      border: "border-emerald-500/30 bg-emerald-950/20",
      title: "Corporate Email & Talent Pools",
      description: "Recruiter corporate email domain verification, custom candidate talent pool management, and AI credit top-ups."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-indigo-400" />,
      border: "border-indigo-500/30 bg-indigo-950/20",
      title: "Candidate Career Portal",
      description: "Dedicated dashboard for candidates to upload resumes, view automated 75%+ job match invitations, and respond in 1 click."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-black uppercase tracking-widest text-pink-400">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Full-Spectrum Recruitment Automation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Our Complete <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Services &amp; Solutions</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium">
          HireAI provides end-to-end intelligent recruitment services designed to automate hiring, eliminate resume noise, and connect interested candidates with recruiters.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {servicesList.map((service, index) => (
          <div key={index} className={`p-7 rounded-3xl space-y-4 bg-slate-900/60 border ${service.border} shadow-lg hover:border-pink-500/50 transition-all group`}>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              {service.icon}
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white">{service.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 text-center space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-wider">Ready to Streamline Your Hiring Process?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105"
          >
            Get Started Now <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105"
          >
            Let's Connect <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
