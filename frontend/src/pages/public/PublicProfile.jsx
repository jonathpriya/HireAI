import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Briefcase, MapPin, GraduationCap, DollarSign, 
  Linkedin, Github, Globe, MessageSquare, Share2, 
  Award, ArrowLeft, Loader2, Code, Check
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
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        <span className="text-xs font-medium text-zinc-500">Loading Candidate Profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Profile Not Found</h2>
        <p className="text-xs text-zinc-500">The requested candidate profile does not exist or has been removed.</p>
        <Link to="/career" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs shadow-subtle">
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
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        
        <button
          onClick={handleShareLink}
          className="px-3.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium text-xs flex items-center gap-1.5 transition shadow-subtle"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
          <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* ─── MINIMAL COVER BANNER & HEADER CARD ─────────────────────── */}
      <div className="rounded-2xl bg-white border border-zinc-200/90 shadow-card overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-950 border-b border-zinc-800 relative" />

        {/* Profile Info Details Block */}
        <div className="px-6 sm:px-8 pb-6 relative">
          
          {/* Avatar & Message Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            
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
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-subtle flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct InMail Message</span>
              </Link>
            </div>

          </div>

          {/* Candidate Name & Info */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                {profile.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                Verified Candidate
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-zinc-600">
              {profile.current_company ? `${profile.current_company} • ` : ''}
              {profile.education || 'Software Engineer'} 
              {profile.experience_years > 0 && ` (${profile.experience_years}+ Yrs Exp)`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-zinc-500 pt-1">
              {profile.preferred_location && (
                <span className="flex items-center gap-1 text-zinc-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {profile.preferred_location}
                </span>
              )}
              {profile.expected_salary && (
                <span className="flex items-center gap-1 text-zinc-600 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> {profile.expected_salary}
                </span>
              )}
            </div>

            {/* Social Links Bar */}
            <div className="flex items-center gap-2 pt-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ⚡ Skills Matrix Section */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" /> Technical Skills &amp; Competencies
        </h3>
        
        {skillList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillList.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/80 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 font-normal">No skills listed yet.</p>
        )}
      </div>

      {/* 💼 Experience & Education Section */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-zinc-700" /> Current Experience
          </h3>
          <p className="text-sm font-semibold text-zinc-900">{profile.current_company || 'Not specified'}</p>
          <p className="text-xs text-zinc-500 font-normal">Total Experience: <strong className="text-zinc-700 font-medium">{profile.experience_years || 0} Years</strong></p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-zinc-700" /> Education &amp; Degree
          </h3>
          <p className="text-sm font-semibold text-zinc-900">{profile.education || 'Not specified'}</p>
        </div>
      </div>

      {/* 🎤 AI Communication Certification Card */}
      {profile.communication_score && (
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900">AI Voice &amp; Communication Certified</p>
              <p className="text-[11px] text-zinc-500 font-normal">Verified speech fluency and verbal communication assessment</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-800 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200 shrink-0">
            {profile.communication_score}% Score
          </span>
        </div>
      )}

    </div>
  );
}
