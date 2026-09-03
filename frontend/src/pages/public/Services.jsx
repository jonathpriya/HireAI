import React from 'react';
import { 
  FileText, Cpu, RefreshCw, MessageSquare, ShieldCheck, UserCheck, 
  Sparkles, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const servicesList = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      border: "border-slate-200 bg-white",
      title: "AI Resume & JD Parsing",
      description: "Automatic parsing of skills, experience, and qualification criteria from PDF and DOCX files using intelligent NLP text extraction."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      border: "border-slate-200 bg-white",
      title: "0–100% AI Skill Matching Engine",
      description: "Objective candidate ranking combining TF-IDF vector similarity and structured skill matrix overlap for accurate fit scoring."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
      border: "border-slate-200 bg-white",
      title: "Automated Shortlist Cascading",
      description: "When a candidate declines an invitation, the system automatically dispatches an invite to the next best match candidate."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      border: "border-slate-200 bg-white",
      title: "Direct InMail Messaging System",
      description: "Direct real-time messaging between recruiters and pre-vetted candidates with instant unread notification badges."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      border: "border-slate-200 bg-white",
      title: "Corporate Email & Talent Pools",
      description: "Recruiter corporate email domain verification, custom candidate talent pool management, and AI credit top-ups."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      border: "border-slate-200 bg-white",
      title: "Candidate Career Portal",
      description: "Dedicated dashboard for candidates to upload resumes, view automated 75%+ job match invitations, and respond in 1 click."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-blue-700 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Full-Spectrum Recruitment Automation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
          Our Complete <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Services &amp; Solutions</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm font-medium">
          HireAI provides end-to-end intelligent recruitment services designed to automate hiring, eliminate resume noise, and connect interested candidates with recruiters.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {servicesList.map((service, index) => (
          <div key={index} className="p-7 rounded-3xl space-y-4 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              {service.icon}
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">{service.title}</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">{service.description}</p>
          </div>
        ))}
      </div>

      {/* High-Contrast Bottom CTA Banner */}
      <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white drop-shadow-sm">
          Ready to Streamline Your Hiring Process?
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl mx-auto">
          Start sourcing top candidates and automating candidate invites in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105"
          >
            Get Started Now <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition hover:scale-105"
          >
            Let's Connect <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </div>

    </div>
  );
}
