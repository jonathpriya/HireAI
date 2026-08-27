import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  User, GraduationCap, Briefcase, Code, Link as LinkIcon, 
  DollarSign, MapPin, Save, CheckCircle, AlertCircle, Zap, MessageSquare, Award, Sparkles, CheckCircle2,
  Camera, Eye, EyeOff, Power, Upload, Trash2, RefreshCw, ExternalLink, Download 
} from 'lucide-react';
import CommunicationAssessmentModal from '../../components/CommunicationAssessmentModal';
import AvatarWithBadge from '../../components/AvatarWithBadge';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function MyProfile() {
  const { user } = useAuth();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [resumeAutoFilled, setResumeAutoFilled] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);

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
      setSkills(p.skills ? p.skills.join(', ') : '');
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
      setProfilePicUrl(p.profile_pic_url || null);
      setCommunicationScore(p.communication_score);

      if (commRes.data?.has_completed) {
        setCommunicationDetails(commRes.data);
      }

      if (resumeRes.data.has_resume && p.skills && p.skills.length > 0) {
        setResumeAutoFilled(true);
      }
    } catch (err) {
      console.error('Failed to fetch candidate profile data', err);
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

    const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean);

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
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fullImageUrl = getFullImageUrl(profilePicUrl);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ── 📸 CANDIDATE PROFILE HEADER & PHOTO SECTION ── */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Avatar and Info */}
          <div className="flex items-center gap-5">
            
            {/* Profile Avatar with LinkedIn #OpenToWork Badge */}
            <div className="relative group shrink-0">
              <AvatarWithBadge
                src={fullImageUrl}
                name={user?.full_name}
                isOpenToWork={isOpenToWork}
                size="lg"
              />

              {/* Quick Camera Icon Button */}
              <label 
                className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20 transition transform hover:scale-110"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleProfilePicChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Profile Details & Photo Actions */}
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                Candidate <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-xs text-slate-500">
                Upload your profile photo and keep your details updated for recruiter searches.
              </p>

              {/* Photo Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <label className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profilePicUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    onChange={handleProfilePicChange} 
                    className="hidden" 
                  />
                </label>

                {profilePicUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePic}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Action Buttons: Open to Work & Share Profile */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleOpenToWork}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                isOpenToWork
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOpenToWork ? '🟢 #OpenToWork (Active)' : '🔴 Inactive (Paused)'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to={`/in/${user?.id}`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to={`/in/${user?.id}`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>ATS Resume</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Progress & AI Assessment Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Profile Strength */}
        <div className="glass-card p-5 rounded-3xl space-y-2 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Profile Strength
            </span>
            <span className="font-extrabold text-blue-600 text-sm">{completionPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: `${completionPct}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500">A complete profile increases recruiter shortlist chance by 3x.</p>
        </div>

        {/* AI Voice Communication Score */}
        <div className="glass-card p-5 rounded-3xl space-y-2 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-600" /> AI Communication Score
            </span>
            {communicationScore !== null && communicationScore !== undefined ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                {communicationScore}%
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-bold">Not assessed</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCommModal(true)}
            className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{communicationScore ? 'Retake Voice Assessment' : 'Take 2-Min Voice Assessment'}</span>
          </button>
        </div>

      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 bg-white border border-slate-200 shadow-sm">
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Highest Education / Degree</label>
            <input
              type="text"
              placeholder="e.g. B.Tech in Computer Science"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Skills (Comma-separated)</label>
          <input
            type="text"
            placeholder="Python, React, Django, PostgreSQL, Docker, AWS"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Company</label>
            <input
              type="text"
              placeholder="e.g. TechCorp Solutions"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expected Salary</label>
            <input
              type="text"
              placeholder="e.g. $100,000 / year or ₹15 LPA"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Work Location</label>
          <input
            type="text"
            placeholder="e.g. Remote, Bangalore, New York"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio / Website URL</label>
            <input
              type="url"
              placeholder="https://myportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Key Projects &amp; Highlights</label>
          <textarea
            rows={3}
            placeholder="Brief overview of major projects you built or contributed to..."
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Profile...' : 'Save & Update Profile'}</span>
        </button>

      </form>

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
