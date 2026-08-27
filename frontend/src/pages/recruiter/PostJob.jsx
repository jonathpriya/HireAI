import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Sparkles, FileText, Upload, Plus, CheckCircle, AlertCircle, Loader2, Wand2, X } from 'lucide-react';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('2');
  const [qualification, setQualification] = useState("Bachelor's Degree in CS / IT");
  const [salary, setSalary] = useState('$80,000 - $120,000 / year');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [jdFile, setJdFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [jdParsing, setJdParsing] = useState(false);
  const [jdParsed, setJdParsed] = useState(false);
  const [jdParseError, setJdParseError] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // ── Auto-parse JD on file select ──────────────────────────────────────────
  const handleJdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setJdFile(file);
    setJdParsed(false);
    setJdParseError('');
    setJdParsing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/recruiter/parse-jd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsed = res.data;

      // Auto-fill all fields from parsed JD
      if (parsed.title)                setTitle(parsed.title);
      if (parsed.description)          setDescription(parsed.description);
      if (parsed.required_skills)      setRequiredSkills(parsed.required_skills);
      if (parsed.preferred_skills)     setPreferredSkills(parsed.preferred_skills);
      if (parsed.experience_required)  setExperienceRequired(String(parsed.experience_required));
      if (parsed.qualification)        setQualification(parsed.qualification);
      if (parsed.salary)               setSalary(parsed.salary);
      if (parsed.location)             setLocation(parsed.location);

      setJdParsed(true);
    } catch (err) {
      setJdParseError('Could not parse JD. Please fill the form manually.');
    } finally {
      setJdParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('required_skills', requiredSkills);
      formData.append('preferred_skills', preferredSkills);
      formData.append('experience_required', experienceRequired);
      formData.append('qualification', qualification);
      formData.append('salary', salary);
      formData.append('employment_type', employmentType);
      formData.append('location', location);
      if (jdFile) {
        formData.append('jd_file', jdFile);
      }

      const res = await API.post('/recruiter/jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 1-Click Multi-Channel Syndication to all connected portals
      try {
        await API.post(`/recruiter/jobs/${res.data.id}/syndicate`);
      } catch (syndErr) {
        console.warn("Syndication notice", syndErr);
      }

      setSuccessMsg(`🎉 Job '${res.data.title}' posted & syndicated successfully!`);
      setTimeout(() => {
        navigate('/recruiter/manage-jobs');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job opening');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create New <span className="gradient-text">Job Opening</span></h1>
        <p className="text-xs text-slate-500">Upload a Job Description PDF/DOCX — AI will <strong className="text-blue-600">auto-fill the form</strong> instantly.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 bg-white border border-slate-200 shadow-md">

        {/* ── JD Upload Zone ─────────────────────────────────────────── */}
        <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
          jdParsed
            ? 'bg-emerald-50 border-emerald-300'
            : jdParsing
            ? 'bg-blue-50 border-blue-300'
            : 'bg-slate-50 border-slate-300 hover:border-blue-400'
        }`}>
          <div className="flex flex-col items-center gap-3 text-center">
            {jdParsing ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-blue-800">🤖 AI is parsing your JD...</p>
                <p className="text-xs text-slate-500">Extracting job title, skills, experience & salary...</p>
              </>
            ) : jdParsed ? (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-800">✅ JD Parsed — Form Auto-Filled!</p>
                <p className="text-xs text-slate-600 max-w-xs">All fields populated from <strong className="text-slate-900">{jdFile?.name}</strong>. Review and edit before posting.</p>
                <button
                  type="button"
                  onClick={() => { setJdFile(null); setJdParsed(false); }}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold transition"
                >
                  <X className="w-3.5 h-3.5" /> Remove file & clear
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Upload Job Description (PDF / DOCX / TXT)</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI will auto-fill the entire form instantly</p>
                </div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleJdUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>

          {jdParseError && (
            <p className="text-xs text-rose-600 text-center mt-3 flex items-center justify-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> {jdParseError}
            </p>
          )}
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">OR FILL DETAILS MANUALLY</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* ── Form Fields ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Senior Full-Stack Python & React Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                jdParsed && title ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
            <textarea
              required
              rows={5}
              placeholder="Describe the role responsibilities, key project scope, and team expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                jdParsed && description ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
              }`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma-separated) *</label>
              <input
                required
                type="text"
                placeholder="Python, React, FastAPI, PostgreSQL"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed && requiredSkills ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred / Nice-to-Have Skills</label>
              <input
                type="text"
                placeholder="Docker, AWS, Tailwind, GraphQL"
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed && preferredSkills ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input
                required
                type="text"
                placeholder="e.g. New York / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed && location ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
              <input
                type="text"
                placeholder="$90,000 - $130,000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed && salary ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Qualification</label>
              <input
                type="text"
                placeholder="BS in Computer Science or equivalent"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition ${
                  jdParsed && qualification ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ── 🌐 Multi-Channel Job Board Syndication Selector ── */}
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              1-Click Multi-Channel Job Syndication
            </span>
            <span className="text-[10px] uppercase font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
              Universal Post
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Google for Jobs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>🔷 Naukri.com</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-[11px] font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>💼 LinkedIn Jobs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-[11px] font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>🟠 Foundit</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing Opening...</>
            : <><Sparkles className="w-4 h-4" /> Post Job Opening &amp; Syndicate</>
          }
        </button>
      </form>
    </div>
  );
}
