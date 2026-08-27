import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  Sparkles, X, Mail, MessageSquare, Linkedin, Copy, Check, ExternalLink, Send, User, Briefcase
} from 'lucide-react';

export default function AIReachoutModal({ candidate, job, onClose }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'linkedin', 'whatsapp'
  const [loading, setLoading] = useState(true);
  const [reachoutData, setReachoutData] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const generateOutreach = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.post('/recruiter/ai-reachout/generate', {
          candidate_name: candidate?.candidate_name || candidate?.full_name || 'Candidate',
          candidate_skills: candidate?.skills || candidate?.matching_skills || [],
          candidate_experience: candidate?.experience_years || 2.0,
          current_company: candidate?.current_company || null,
          job_title: job?.title || candidate?.job_title || 'Software Engineer',
          company_name: job?.company_name || candidate?.company_name || 'HireAI Partner',
          job_location: job?.location || candidate?.location || 'Remote'
        });
        setReachoutData(res.data);
      } catch (err) {
        console.error('Failed to generate AI reachout', err);
        setError('Failed to generate personalized AI reachout.');
      } finally {
        setLoading(false);
      }
    };

    generateOutreach();
  }, [candidate, job]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const candidatePhone = candidate?.mobile?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = candidatePhone 
    ? `https://wa.me/${candidatePhone}?text=${encodeURIComponent(reachoutData?.whatsapp?.message || '')}`
    : `https://wa.me/?text=${encodeURIComponent(reachoutData?.whatsapp?.message || '')}`;

  const mailtoUrl = `mailto:${candidate?.email || ''}?subject=${encodeURIComponent(reachoutData?.email?.subject || '')}&body=${encodeURIComponent(reachoutData?.email?.body || '')}`;

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-2xl w-full max-h-[92vh] rounded-3xl border border-purple-500/40 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                AI Auto-Reachout &amp; Personalized Outreach
              </h3>
              <p className="text-xs text-slate-400">
                Personalized for <span className="text-purple-300 font-bold">{candidate?.candidate_name || candidate?.full_name}</span> · {job?.title || candidate?.job_title}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Pitch
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'linkedin'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Linkedin className="w-4 h-4" /> LinkedIn InMail
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp / SMS
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-grow text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
              <span>Generating AI personalized outreach based on candidate skills &amp; JD...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">{error}</div>
          ) : (
            <>
              {/* TAB 1: EMAIL */}
              {activeTab === 'email' && reachoutData?.email && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Subject:</span>
                      <span className="font-semibold text-slate-200 text-xs">{reachoutData.email.subject}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(reachoutData.email.subject, 'subj')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700 transition flex items-center gap-1"
                    >
                      {copiedKey === 'subj' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'subj' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-slate-400 text-[11px]">Email Message Body:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={mailtoUrl}
                          className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Open in Mail App
                        </a>
                        <button
                          onClick={() => copyToClipboard(reachoutData.email.body, 'body')}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition border border-slate-700"
                        >
                          {copiedKey === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'body' ? 'Copied' : 'Copy Email'}</span>
                        </button>
                      </div>
                    </div>

                    <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed text-xs">
                      {reachoutData.email.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 2: LINKEDIN */}
              {activeTab === 'linkedin' && reachoutData?.linkedin && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-sky-400 text-[11px] flex items-center gap-1.5">
                      <Linkedin className="w-4 h-4" /> 1-Click LinkedIn InMail Message:
                    </span>
                    <button
                      onClick={() => copyToClipboard(reachoutData.linkedin.message, 'linkedin')}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      {copiedKey === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'linkedin' ? 'Copied InMail' : 'Copy InMail'}</span>
                    </button>
                  </div>

                  <pre className="text-slate-200 font-sans whitespace-pre-wrap leading-relaxed text-xs">
                    {reachoutData.linkedin.message}
                  </pre>
                </div>
              )}

              {/* TAB 3: WHATSAPP */}
              {activeTab === 'whatsapp' && reachoutData?.whatsapp && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> WhatsApp / SMS Message:
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center gap-1 transition shadow-md shadow-emerald-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp Chat
                      </a>
                      <button
                        onClick={() => copyToClipboard(reachoutData.whatsapp.message, 'whatsapp')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition border border-slate-700"
                      >
                        {copiedKey === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'whatsapp' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="text-slate-200 font-sans whitespace-pre-wrap leading-relaxed text-xs">
                    {reachoutData.whatsapp.message}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
