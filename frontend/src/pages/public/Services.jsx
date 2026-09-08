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
    <div className="min-h-[calc(100vh-140px)] bg-[#fafafa] text-zinc-900 py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-medium shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Full-Spectrum Recruitment Automation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
          Services built for <br />
          <span className="text-zinc-500">modern recruiting teams.</span>
        </h1>
        <p className="text-zinc-500 max-w-xl mx-auto text-sm sm:text-base font-normal leading-relaxed">
          HireAI delivers end-to-end intelligent recruitment tools to automate candidate sourcing, eliminate resume noise, and accelerate hiring.
        </p>
      </div>

      {/* Services Grid (Bento Style) */}
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicesList.map((service, index) => (
          <div 
            key={index} 
            className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle hover:shadow-card hover:border-zinc-300 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              {service.icon}
            </div>
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{service.title}</h3>
            <p className="text-zinc-500 text-xs leading-relaxed font-normal">{service.description}</p>
          </div>
        ))}
      </div>

      {/* High-Contrast Minimalist Bottom CTA Banner */}
      <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl bg-zinc-900 text-center text-white space-y-6 shadow-card">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Ready to streamline your hiring process?
        </h2>
        <p className="text-sm text-zinc-400 font-normal max-w-lg mx-auto leading-relaxed">
          Start sourcing qualified talent and automating candidate outreach today.
        </p>

        <div className="flex items-center justify-center pt-2">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs transition flex items-center gap-2 shadow-subtle hover:scale-[1.02]"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-700" />
          </Link>
        </div>
      </div>

    </div>
  );
}
