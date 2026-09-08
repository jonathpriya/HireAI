import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  User, GraduationCap, Briefcase, Code, Link as LinkIcon, 
  DollarSign, MapPin, Save, CheckCircle, AlertCircle, Zap, MessageSquare, Award, Sparkles, CheckCircle2,
  Camera, Eye, EyeOff, Power, Upload, Trash2, RefreshCw, ExternalLink, Download, Edit3, Globe, Linkedin, Github, FileText, Mail,
  Share2, Copy, Check
} from 'lucide-react';
import CommunicationAssessmentModal from '../../components/CommunicationAssessmentModal';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'edit'

  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [projects, setProjects] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [completionPct, setCompletionPct] = useState(20);
  const [communicationScore, setCommunicationScore] = useState(null);
  const [communicationDetails, setCommunicationDetails] = useState(null);
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [showCommModal, setShowCommModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchProfileData = async () => {
    try {
      const [profileRes, resumeRes, commRes] = await Promise.all([
        API.get('/candidate/profile'),
        API.get('/candidate/resume'),
        API.get('/candidate/communication-assessment/result')
      ]);
      const p = profileRes.data;
      setEducation(p.education || '');
      setExperienceYears(p.experience_years || 0);
      setSkills(Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || ''));
      setCertifications(p.certifications || '');
      setProjects(p.projects || '');
      setCurrentCompany(p.current_company || '');
      setExpectedSalary(p.expected_salary || '');
      setPreferredLocation(p.preferred_location || '');
      setLinkedinUrl(p.linkedin_url || '');
      setGithubUrl(p.github_url || '');
      setPortfolioUrl(p.portfolio_url || '');
      setCompletionPct(p.completion_pct || 20);
      setIsOpenToWork(p.is_open_to_work ?? true);
      setProfilePicUrl(p.profile_pic_url || user?.profile_pic_url || null);
      setImgError(false);
      setCommunicationScore(p.communication_score);

      if (resumeRes.data?.has_resume) {
        setResumeData(resumeRes.data);
      }

      if (commRes.data?.has_completed) {
        setCommunicationDetails(commRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch candidate profile data', err);
      setError('Failed to load profile data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleToggleOpenToWork = async () => {
    const nextState = !isOpenToWork;
    setIsOpenToWork(nextState);
    try {
      await API.patch('/candidate/open-to-work', { is_open_to_work: nextState });
    } catch (err) {
      console.error("Failed to update Open to Work status", err);
      setIsOpenToWork(!nextState);
    }
  };

  const handleCopyProfileLink = () => {
    const publicUrl = `${window.location.origin}/in/${user?.id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setMsg('Public profile link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setMsg('');
    }, 3000);
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    setUploadingPic(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/candidate/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfilePicUrl(res.data.profile_pic_url);
      setImgError(false);
      if (updateUser) {
        updateUser({ profile_pic_url: res.data.profile_pic_url });
      }
      setMsg('Profile picture updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload photo.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    setUploadingPic(true);
    setError('');
    try {
      await API.delete('/candidate/profile-picture');
      setProfilePicUrl(null);
      if (updateUser) {
        updateUser({ profile_pic_url: null });
      }
      setMsg('Profile picture removed.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove photo.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    const skillArray = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(skills) ? skills : []);

    try {
      const res = await API.put('/candidate/profile', {
        education,
        experience_years: parseFloat(experienceYears) || 0,
        skills: skillArray,
        certifications,
        projects,
        current_company: currentCompany,
        expected_salary: expectedSalary,
        preferred_location: preferredLocation,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        is_open_to_work: isOpenToWork,
      });
      setMsg('Profile updated successfully!');
      if (res.data?.completion_pct) {
        setCompletionPct(res.data.completion_pct);
      }
      setActiveTab('view');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-500 font-medium space-y-3">
        <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading Candidate Profile...</p>
      </div>
    );
  }

  const effectivePicUrl = profilePicUrl || user?.profile_pic_url;
  const fullImageUrl = getFullImageUrl(effectivePicUrl);
  const skillList = typeof skills === 'string'
    ? skills.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(skills) ? skills : []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast Feedback */}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── 🌄 MINIMAL SAAS COVER BANNER & HEADER CARD ─────────────────────── */}
      <div className="rounded-2xl bg-white border border-zinc-200/90 shadow-card overflow-hidden">
        
        {/* Cover Banner Header */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-950 border-b border-zinc-800 relative p-4 flex justify-end items-start">
          <button
            onClick={() => setActiveTab(activeTab === 'view' ? 'edit' : 'view')}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/60 text-white font-medium text-xs flex items-center gap-1.5 shadow-subtle transition z-10"
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-300" />
            <span>{activeTab === 'view' ? 'Edit Profile' : 'View Mode'}</span>
          </button>
        </div>

        {/* Profile Info Details Block */}
        <div className="px-6 sm:px-8 pb-6 relative">
          
          {/* Avatar & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            
            {/* Avatar Circle with Camera Overlay */}
            <div className="relative shrink-0 z-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-card bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 text-2xl relative overflow-hidden">
                {fullImageUrl && !imgError ? (
                  <img
                    src={fullImageUrl}
                    alt={user?.full_name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span>{user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'AA'}</span>
                )}
              </div>

              {/* Camera Upload Button Overlay */}
              <label 
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-subtle transition z-30"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleProfilePicChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 z-10">
              <button
                type="button"
                onClick={handleToggleOpenToWork}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition shadow-subtle ${
                  isOpenToWork
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isOpenToWork ? '🟢 #OpenToWork' : '🔴 Inactive'}</span>
              </button>

              {/* 🔗 1-Click Copy Profile Link Button */}
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-subtle"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Profile Link'}</span>
              </button>

              {/* Preview Button */}
              <Link
                to={`/in/${user?.id}`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium text-xs flex items-center gap-1.5 transition shadow-subtle"
                title="Preview public profile"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>Preview</span>
              </Link>
            </div>

          </div>

          {/* Candidate Name & Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                {user?.full_name || 'Aarav Sharma'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                Verified Candidate
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-zinc-600">
              {currentCompany ? `${currentCompany} • ` : ''}
              {education || 'Software Engineer'} 
              {experienceYears > 0 && ` (${experienceYears} Yrs Exp)`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-zinc-500 pt-1">
              {preferredLocation && (
                <span className="flex items-center gap-1 text-zinc-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {preferredLocation}
                </span>
              )}
              {expectedSalary && (
                <span className="flex items-center gap-1 text-zinc-600 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> {expectedSalary}
                </span>
              )}
              <span className="flex items-center gap-1 text-zinc-500">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> {user?.email}
              </span>
            </div>

            {/* Social Links Bar */}
            <div className="flex items-center gap-2 pt-2">
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {portfolioUrl && (
                <a href={portfolioUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition">
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ─── 📊 MINIMAL ANALYTICS BAR ────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Private Analytics &amp; Recruiter Insights
          </h3>
          <span className="text-[11px] font-medium text-zinc-400">Only visible to you</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-0.5">
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">24</p>
            <p className="text-xs font-medium text-zinc-500">Recruiter Views</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-0.5">
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">{completionPct}%</p>
            <p className="text-xs font-medium text-zinc-500">AI Match Index</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-0.5">
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">5</p>
            <p className="text-xs font-medium text-zinc-500">Shortlist Appearances</p>
          </div>
        </div>
      </div>

      {/* ─── VIEW MODE vs EDIT MODE TOGGLE ───────────────────────────────────── */}
      {activeTab === 'view' ? (
        <div className="space-y-6">
          
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
              <p className="text-xs text-zinc-400 font-normal">No skills added yet. Click "Edit Profile" to add your core technical skills.</p>
            )}
          </div>

          {/* 💼 Experience & Education Section */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-700" /> Current Experience
              </h3>
              <p className="text-sm font-semibold text-zinc-900">{currentCompany || 'Not specified'}</p>
              <p className="text-xs text-zinc-500 font-normal">Total Experience: <strong className="text-zinc-700 font-medium">{experienceYears} Years</strong></p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-700" /> Education &amp; Degree
              </h3>
              <p className="text-sm font-semibold text-zinc-900">{education || 'Not specified'}</p>
              {certifications && (
                <p className="text-xs text-slate-500 font-medium pt-1">
                  <strong>Certifications:</strong> {certifications}
                </p>
              )}
            </div>
          </div>

          {/* 📄 Active Resume Card */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Active Resume File
              </h3>
              <Link
                to="/candidate/resume-upload"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-subtle"
              >
                <Upload className="w-3.5 h-3.5" /> Upload / Replace
              </Link>
            </div>

            {resumeData?.has_resume ? (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">{resumeData.file_name || 'Candidate_Resume.pdf'}</p>
                    <p className="text-[11px] text-zinc-500 font-normal">Extracted {resumeData.extracted_experience_years || experienceYears} Yrs Experience</p>
                  </div>
                </div>

                <a
                  href={resumeData.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition flex items-center gap-1 shadow-subtle"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 font-normal flex items-center justify-between">
                <span>No resume uploaded yet.</span>
                <Link to="/candidate/resume-upload" className="text-blue-600 font-medium hover:underline">Upload Resume Now</Link>
              </div>
            )}
          </div>

          {/* 🎤 AI Voice Communication Score Card */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> AI Communication Score
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                {communicationScore ? `Your voice fluency score is ${communicationScore}%. Recruiter views prioritize high communication scores.` : 'Take a 2-minute voice assessment to highlight your fluency.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCommModal(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-subtle transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{communicationScore ? 'Retake Assessment' : 'Take Voice Assessment'}</span>
            </button>
          </div>

        </div>
      ) : (
        /* ── EDIT PROFILE FORM ── */
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl space-y-5 bg-white border border-zinc-200/90 shadow-card">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-zinc-700" /> Edit Candidate Details
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Highest Education / Degree</label>
              <input
                type="text"
                placeholder="e.g. B.Tech in Computer Science"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Total Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Technical Skills (Comma-separated)</label>
            <input
              type="text"
              placeholder="Python, React, Django, PostgreSQL, Docker, AWS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Current Company</label>
              <input
                type="text"
                placeholder="e.g. TechCorp Solutions"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Expected Salary</label>
              <input
                type="text"
                placeholder="e.g. $100,000 / year or ₹15 LPA"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Preferred Work Location</label>
            <input
              type="text"
              placeholder="e.g. Remote, Bangalore, New York"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Portfolio / Website URL</label>
              <input
                type="url"
                placeholder="https://myportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Certifications</label>
            <input
              type="text"
              placeholder="AWS Certified Developer, Certified Kubernetes Administrator"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-subtle transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save & Update Profile'}</span>
          </button>

        </form>
      )}

      {/* Voice Assessment Modal */}
      {showCommModal && (
        <CommunicationAssessmentModal
          onClose={() => setShowCommModal(false)}
          onCompleted={(result) => {
            setCommunicationScore(result.score);
            setCommunicationDetails(result);
            setShowCommModal(false);
          }}
        />
      )}

    </div>
  );
}
