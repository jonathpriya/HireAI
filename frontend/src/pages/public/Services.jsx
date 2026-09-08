import React from 'react';
import { 
  FileText, Cpu, RefreshCw, MessageSquare, ShieldCheck, UserCheck, 
  Sparkles, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const servicesList = [
    {
      icon: <FileText className="w-5 h-5 text-zinc-800" />,
      title: "AI Resume & JD Parsing",
      description: "Extract structured skills, experience levels, and qualification criteria from PDF and DOCX files using intelligent NLP parsing."
    },
    {
      icon: <Cpu className="w-5 h-5 text-zinc-800" />,
      title: "0–100% Skill Matching Engine",
      description: "Objective ranking combining vector similarity and structured skill matrix overlap for precise candidate-to-job fit scoring."
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-zinc-800" />,
      title: "Automated Shortlist Cascading",
      description: "When an invitation is declined, the pipeline automatically advances and dispatches invites to the next best match."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-zinc-800" />,
      title: "Direct InMail Messaging System",
      description: "Secure real-time communication between hiring teams and verified candidates with instant notification badges."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-zinc-800" />,
      title: "Corporate Email & Talent Pools",
      description: "Verified employer domains, customized candidate pools, and on-demand AI talent matching credits."
    },
    {
      icon: <UserCheck className="w-5 h-5 text-zinc-800" />,
      title: "Candidate Career Portal",
      description: "Dedicated workspace for talent to showcase profiles, view verified job match invitations, and respond in 1 click."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-transparent text-white py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-blue-300 text-xs font-semibold shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full-Spectrum Recruitment Automation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Services built for <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">modern recruiting teams.</span>
        </h1>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base font-normal leading-relaxed">
          HireAI delivers end-to-end intelligent recruitment tools to automate candidate sourcing, eliminate resume noise, and accelerate hiring.
        </p>
      </div>

      {/* Services Grid (Bento Style) */}
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicesList.map((service, index) => (
          <div 
            key={index} 
            className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg hover:shadow-2xl hover:border-slate-300 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              {service.icon}
            </div>
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">{service.title}</h3>
            <p className="text-zinc-600 text-xs leading-relaxed font-normal">{service.description}</p>
          </div>
        ))}
      </div>

      {/* High-Contrast Minimalist Bottom CTA Banner */}
      <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-center text-white space-y-6 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Ready to streamline your hiring process?
        </h2>
        <p className="text-sm text-slate-300 font-normal max-w-lg mx-auto leading-relaxed">
          Start sourcing qualified talent and automating candidate outreach today.
        </p>

        <div className="flex items-center justify-center pt-2">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
          </Link>
        </div>
      </div>

    </div>
  );
}
