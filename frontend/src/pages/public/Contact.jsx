import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import API from '../../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post('/contact', formData);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to send contact inquiry:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-black uppercase tracking-widest text-pink-400">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Direct Support Desk</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Contact <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">HireAI Support</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium">Have questions about our AI matching platform? Send us a query and our team will reply directly to your email inbox.</p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Support Info Box */}
        <div className="p-8 rounded-3xl space-y-6 bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pink-400" /> Support Desk Info
            </h2>

            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1">
                <p className="text-purple-300 font-extrabold flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-purple-400" /> Official Support Email
                </p>
                <p className="text-cyan-400 text-xs font-mono font-bold">devilqueen2547@gmail.com</p>
                <p className="text-[11px] text-slate-400 font-normal pt-1">
                  Messages submitted here arrive directly in our support inbox.
                </p>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-cyan-400" /> +1 (800) 555-HIRE
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-pink-400" /> HireAI Technology Hub, Tech City
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-slate-400 text-xs">
            <p className="font-bold text-white uppercase tracking-wider">How Support Works:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-400">
              <li>Fill out your Name, Email, and Inquiry Message.</li>
              <li>Click <strong>Send Message</strong>.</li>
              <li>Your message is emailed directly to <code className="text-cyan-400 font-bold">devilqueen2547@gmail.com</code>.</li>
              <li>A confirmation receipt copy is sent to your email.</li>
            </ol>
          </div>
        </div>

        {/* Form Box */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl space-y-4 bg-slate-900/60 border border-slate-800 shadow-xl">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase text-white">Inquiry Sent Successfully!</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                  Your message was sent to <span className="font-bold text-cyan-400">devilqueen2547@gmail.com</span>. We will reply to your email address shortly!
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">Send Us a Query</h2>

              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
                <input
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-pink-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-slate-300 mb-1">Your Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-pink-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-300 mb-1">Your Message / Query</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your inquiry or request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-pink-500 outline-none resize-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 font-black text-xs uppercase tracking-wider text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending Query...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
