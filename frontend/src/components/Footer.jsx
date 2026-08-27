import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span>Hire<span className="gradient-text">AI</span></span>
        </div>
        <p className="flex items-center gap-1 text-xs">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using FastAPI, React & NLP Matching Engine
        </p>
        <p className="text-xs">&copy; {new Date().getFullYear()} HireAI Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
