import React, { useState, useEffect } from 'react';
import API from '../services/api';

import { 
  Globe, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Send, 
  ExternalLink, Zap, Share2, Layers, Check
} from 'lucide-react';

export default function MultiChannelSyndicationModal({ job, onClose }) {
  const [loading, setLoading] = useState(true);
  const [syndicationData, setSyndicationData] = useState(null);
  const [error, setError] = useState('');

  const triggerSyndication = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post(`/recruiter/jobs/${job.id}/syndicate`);
      setSyndicationData(res.data);
    } catch (err) {
      console.error("Syndication failed", err);
      setError("Failed to distribute job across all channels. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job?.id) {
      triggerSyndication();
    }
  }, [job?.id]);

  const getChannelBadge = (platform) => {
    switch (platform) {
      case 'naukri':
        return <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200">NAUKRI</span>;
      case 'linkedin':
        return <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-extrabold text-[10px] border border-sky-200">LINKEDIN</span>;
      case 'monster':
        return <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200">FOUNDIT</span>;
      case 'google_jobs':
        return <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">GOOGLE</span>;
      case 'xml_feed':
        return <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-200">INDEED / XML</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-extrabold text-[10px] border border-amber-200">BROADCAST</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full rounded-3xl border border-slate-200 bg-white p-6 space-y-6 shadow-2xl animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Channel Job Syndication</h3>
              <p className="text-xs text-slate-500">Broadcasting "{job.title}" across free &amp; premium job portals</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3 font-semibold">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-slate-800">Distributing job across Google, Naukri, LinkedIn &amp; Indeed...</span>
          </div>
        ) : syndicationData ? (
          <div className="space-y-4">
            
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Syndication Completed across {syndicationData.syndicated_channels.length} Channels!
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">100% Synced</span>
            </div>

            {/* Channels List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {syndicationData.syndicated_channels.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {getChannelBadge(ch.platform)}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{ch.name}</div>
                      <div className="text-[10px] text-slate-500">{ch.channel_type}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {ch.status === 'published' || ch.status === 'synced' || ch.status === 'broadcasted' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Published
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700">
                        Ready to Connect
                      </span>
                    )}
                    {ch.reference_id && (
                      <div className="text-[9px] text-slate-500 font-mono">{ch.reference_id}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Public Free Links */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Direct XML Feed available for aggregators:</span>
              <a
                href="http://localhost:8000/api/jobs/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                feed.xml <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-md shadow-blue-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
