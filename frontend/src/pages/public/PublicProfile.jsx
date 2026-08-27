import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Sparkles, UserCheck, Briefcase, MapPin, GraduationCap, DollarSign, 
  Linkedin, Github, Globe, FileText, MessageSquare, Download, Share2, 
  CheckCircle2, Award, ArrowLeft, Loader2, Phone, Mail 
} from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await API.get(`/candidate/public-profile/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching public profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintResume = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-bold text-slate-500">Loading Candidate Profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested candidate profile does not exist or has been removed.</p>
        <Link to="/career" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Explore Open Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareLink}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
          </button>

          <button
            onClick={handlePrintResume}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📄 Print / Save ATS Resume</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card (Printable ATS Resume Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <AvatarWithBadge
              src={profile.profile_pic_url}
              name={profile.full_name}
              isOpenToWork={profile.is_open_to_work}
              size="xl"
            />

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
              <p className="text-sm font-bold text-blue-600">{profile.current_company}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.preferred_location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {profile.experience_years}+ Yrs Experience</span>
              </div>
            </div>
          </div>

          {/* Contact / Message Trigger */}
          <div className="flex flex-col gap-2 shrink-0 no-print">
            <Link
              to={`/messages?user_id=${profile.id}`}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct InMail Message</span>
            </Link>

            {profile.resume_url && (
              <a
                href={profile.resume_url.startsWith('http') ? profile.resume_url : `http://localhost:8000${profile.resume_url}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Original Resume File</span>
              </a>
            )}
          </div>
        </div>

        {/* AI Badges & Voice Assessment */}
        {profile.communication_score && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">AI Voice &amp; Communication Certified</p>
                <p className="text-[11px] text-slate-600 font-medium">Verified English speech fluency and verbal communication assessment</p>
              </div>
            </div>
            <span className="text-base font-black text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm">
              🗣️ {profile.communication_score}% Score
            </span>
          </div>
        )}

        {/* Skills Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> Technical Skills &amp; Competencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium">No skills listed yet.</p>
            )}
          </div>
        </div>

        {/* Experience & Education Grid */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Education
            </h3>
            <p className="text-sm font-bold text-slate-800">{profile.education || 'Bachelor / Equivalent'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Expected Compensation
            </h3>
            <p className="text-sm font-bold text-slate-800">{profile.expected_salary}</p>
          </div>
        </div>

        {/* Social / Portfolio Links */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
              <Linkedin className="w-4 h-4" /> LinkedIn Profile
            </a>
          )}
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-900 hover:underline">
              <Github className="w-4 h-4" /> GitHub Repositories
            </a>
          )}
          {profile.portfolio_url && (
            <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
              <Globe className="w-4 h-4" /> Live Portfolio
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
