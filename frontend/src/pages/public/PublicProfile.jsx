import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Sparkles, UserCheck, Briefcase, MapPin, GraduationCap, DollarSign, 
  Linkedin, Github, Globe, FileText, MessageSquare, Share2, 
  CheckCircle2, Award, ArrowLeft, Loader2, Mail, Code
} from 'lucide-react';
import AvatarWithBadge from '../../components/AvatarWithBadge';
import { getFullImageUrl } from '../../utils/imageUrl';

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

  const fullImageUrl = getFullImageUrl(profile.profile_pic_url);
  const skillList = Array.isArray(profile.skills) ? profile.skills : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <button
          onClick={handleShareLink}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* ─── 🌄 LINKEDIN STYLE COVER BANNER & HEADER CARD ─────────────────────── */}
      <div className="glass-card rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative" />

        {/* Profile Info Details Block */}
        <div className="px-6 sm:px-8 pb-7 relative">
          
          {/* Avatar & Message Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            
            {/* Avatar Circle */}
            <div className="relative shrink-0 z-20">
              <AvatarWithBadge
                src={fullImageUrl}
                name={profile.full_name}
                isOpenToWork={profile.is_open_to_work}
                size="xl"
              />
            </div>

            {/* Direct InMail Message Button for Recruiters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 z-10">
              <Link
                to={`/messages?user_id=${profile.id}`}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Direct InMail Message</span>
              </Link>
            </div>

          </div>

          {/* Candidate Name & Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {profile.full_name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                Verified Candidate
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700">
              {profile.current_company ? `${profile.current_company} • ` : ''}
              {profile.education || 'Software Engineer'} 
              {profile.experience_years > 0 && ` (${profile.experience_years}+ Yrs Exp)`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              {profile.preferred_location && (
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {profile.preferred_location}
                </span>
              )}
              {profile.expected_salary && (
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {profile.expected_salary}
                </span>
              )}
            </div>

            {/* Social Links Bar */}
            <div className="flex items-center gap-3 pt-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ⚡ Skills Matrix Section */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" /> Technical Skills &amp; Competencies
        </h3>
        
        {skillList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillList.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-extrabold shadow-sm"
              >
                ⚡ {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">No skills listed yet.</p>
        )}
      </div>

      {/* 💼 Experience & Education Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" /> Current Experience
          </h3>
          <p className="text-sm font-bold text-slate-800">{profile.current_company || 'Not specified'}</p>
          <p className="text-xs text-slate-500 font-medium">Total Experience: <strong>{profile.experience_years || 0} Years</strong></p>
        </div>

        <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" /> Education &amp; Degree
          </h3>
          <p className="text-sm font-bold text-slate-800">{profile.education || 'Not specified'}</p>
        </div>
      </div>

      {/* 🎤 AI Communication Certification Card */}
      {profile.communication_score && (
        <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">AI Voice &amp; Communication Certified</p>
              <p className="text-[11px] text-slate-500 font-medium">Verified English speech fluency and verbal communication assessment</p>
            </div>
          </div>
          <span className="text-sm font-black text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-200 shrink-0">
            🗣️ {profile.communication_score}% Score
          </span>
        </div>
      )}

    </div>
  );
}
