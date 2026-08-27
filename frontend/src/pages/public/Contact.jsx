import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Contact <span className="gradient-text">HireAI Support</span></h1>
        <p className="text-slate-500 text-sm font-medium">Have questions about our platform? We are here to help.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-3xl space-y-6 bg-white border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Get in Touch</h2>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" /> support@hireai-platform.com
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-indigo-600" /> +1 (800) 555-HIRE
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" /> AI Innovation Hub, Tech City
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-4 bg-white border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 text-emerald-800 font-bold space-y-2">
              <p className="text-base">Message Sent Successfully!</p>
              <p className="text-xs text-slate-500 font-normal">Our team will get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea required rows={4} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 outline-none resize-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-xl shadow-sm transition flex items-center justify-center gap-2">
                Send Message <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
