import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Globe, X, Copy, Check, Share2, Sparkles, Code, ExternalLink, MessageSquare, Linkedin
} from 'lucide-react';

export default function FreeJobBoardSyndicationModal({ job, onClose }) {
  const [copiedSection, setCopiedSection] = useState('');

  const jobUrl = `${window.location.origin}/career?job_id=${job?.id || ''}`;
  const skillsStr = (job?.required_skills || []).join(', ');

  // 1. Google for Jobs Schema
  const googleSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job?.title || "Software Position",
    "description": job?.description || "",
    "datePosted": new Date().toISOString().split('T')[0],
    "employmentType": (job?.employment_type || "FULL_TIME").toUpperCase().replace('-', '_'),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job?.company_name || "Company"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job?.location || "Remote"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "unitText": "YEAR"
      }
    }
  };

  // 2. LinkedIn Free Post Template
  const linkedinText = `🚀 WE ARE HIRING! 🚀

Position: ${job?.title}
Company: ${job?.company_name || "HireAI Partner"}
Location: ${job?.location} (${job?.employment_type})
Experience Needed: ${job?.experience_required}+ Years

Required Skills:
${skillsStr}

Apply now or check your AI match score:
👉 ${jobUrl}

#Hiring #JobOpening #SoftwareEngineering #Career #TechJobs`;

  // 3. WhatsApp / Telegram Alert Template
  const messagingText = `📢 *JOB ALERT: ${job?.title}* at *${job?.company_name || "TechCorp"}*
📍 Location: ${job?.location}
💻 Required Skills: ${skillsStr}
💼 Exp: ${job?.experience_required}+ Yrs

Check your AI match score and apply here:
${jobUrl}`;

  const copyToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(''), 2500);
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-3xl w-full max-h-[92vh] rounded-3xl border border-blue-500/40 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Free Job Board Syndication &amp; Distribution</h3>
              <p className="text-xs text-slate-400">Post for free to Google for Jobs, LinkedIn Free, Indeed, WhatsApp &amp; Telegram</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow text-xs">
          
          {/* Quick Free Job Sites Info */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2 text-blue-200">
            <span className="font-extrabold flex items-center gap-1.5 text-sm text-blue-300">
              <Sparkles className="w-4 h-4 text-amber-300" /> Free Job Posting Sites Included:
            </span>
            <div className="flex flex-wrap gap-2 pt-1 font-semibold text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30">Google for Jobs</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30">LinkedIn Free Post</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30">Indeed Free Listing</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30">ZipRecruiter Share</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30">WhatsApp &amp; Telegram Groups</span>
            </div>
          </div>

          {/* Section 1: LinkedIn Free Post */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn / Indeed Free Hiring Template
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(linkedinText, 'linkedin')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                {copiedSection === 'linkedin' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Template</>}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
              {linkedinText}
            </pre>
          </div>

          {/* Section 2: WhatsApp / Telegram */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp &amp; Telegram Instant Share Alert
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(messagingText, 'whatsapp')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                {copiedSection === 'whatsapp' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Alert</>}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
              {messagingText}
            </pre>
          </div>

          {/* Section 3: Google for Jobs JSON-LD */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Code className="w-4 h-4 text-purple-400" /> Google for Jobs Schema Markup (JSON-LD)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(googleSchema, null, 2), 'schema')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                {copiedSection === 'schema' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Schema</>}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-[11px] overflow-x-auto">
              {JSON.stringify(googleSchema, null, 2)}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
