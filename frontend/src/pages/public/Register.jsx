import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  Sparkles, User, Mail, Lock, Phone, Building, Globe, AlertCircle, 
  ArrowRight, Gift, Camera, Upload, Trash2, RefreshCw, CheckCircle2, Image as ImageIcon
} from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'candidate';
  const initialRef = searchParams.get('ref') || '';

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [referralCode, setReferralCode] = useState(initialRef);
  
  // Profile Picture state for candidates
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be less than 5MB.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        role,
        full_name: fullName,
        email,
        mobile,
        password,
        referral_code: referralCode.trim() || undefined,
        ...(role === 'recruiter' && { company_name: companyName, website })
      };

      const data = await register(payload);

      // If candidate uploaded a photo during signup, upload it immediately
      if (role === 'candidate' && photoFile) {
        try {
          const formData = new FormData();
          formData.append('file', photoFile);
          const picRes = await API.post('/candidate/profile-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (updateUser && picRes.data.profile_pic_url) {
            updateUser({ profile_pic_url: picRes.data.profile_pic_url });
          }
        } catch (picErr) {
          console.error("Profile picture upload warning:", picErr);
        }
      }

      const jobId = searchParams.get('job_id');
      if (data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (jobId) {
        navigate(`/candidate/resume-upload?job_id=${jobId}`);
      } else {
        navigate('/candidate/resume-upload');
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="glass-card p-8 rounded-3xl space-y-6 bg-white border border-slate-200 shadow-sm">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-500 font-medium">Join HireAI as a Candidate or Corporate Recruiter</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-2 rounded-xl transition ${role === 'candidate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Candidate / Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-2 rounded-xl transition ${role === 'recruiter' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Recruiter / Employer
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ── 📸 Candidate Profile Picture Upload (LinkedIn Style) ── */}
          {role === 'candidate' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Profile Photo (LinkedIn Style)
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Recommended
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border-2 border-blue-200 overflow-hidden flex items-center justify-center text-blue-600 shadow-sm">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  {/* Camera icon trigger */}
                  <label 
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md transition transform hover:scale-110"
                    title="Choose Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      onChange={handlePhotoSelect} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Photo Actions & Guidance */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={handlePhotoSelect} 
                        className="hidden" 
                      />
                    </label>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    JPG, PNG or WebP up to 5MB. Recruiters see this photo in shortlists!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reg-fullname" className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="reg-fullname"
                name="full_name"
                autoComplete="name"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'recruiter' ? 'Preethi Sharma' : 'Aarav Sharma'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'recruiter' ? 'Corporate Work Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="reg-email"
                name="email"
                autoComplete="email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'recruiter' ? 'recruiter@techcorp.com' : 'aarav@gmail.com'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            {role === 'recruiter' && (
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                * Corporate work email required (must match company website domain).
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-mobile" className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="reg-mobile"
                name="mobile"
                autoComplete="tel"
                required
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {role === 'recruiter' && (
            <>
              <div>
                <label htmlFor="reg-company" className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-company"
                    name="company_name"
                    autoComplete="organization"
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechCorp Solutions"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-website" className="block text-xs font-bold text-slate-700 mb-1">Company Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-website"
                    name="website"
                    autoComplete="url"
                    required
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://techcorp.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="reg-password"
                name="password"
                autoComplete="new-password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-referral" className="block text-xs font-bold text-slate-700 mb-1">Referral Code (Optional)</label>
            <div className="relative">
              <Gift className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
              <input
                id="reg-referral"
                name="referral_code"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. REF-ABC123"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Enter a friend's referral code to get bonus starter credits!
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
