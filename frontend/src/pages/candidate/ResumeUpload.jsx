import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, Sparkles, Cpu,
  Award, Download, RefreshCw, ArrowRight, Zap, MapPin,
  GraduationCap, Building, Linkedin, Github
} from 'lucide-react';

export default function ResumeUpload() {
  const [searchParams] = useSearchParams();
  const targetJobId = searchParams.get('job_id');

  const [existingResume, setExistingResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();

  const fetchExistingResume = async () => {
    setFetching(true);
    try {
      const res = await API.get('/candidate/resume');
      if (res.data.has_resume) {
        setExistingResume(res.data);
      } else {
        setExistingResume(null);
        setShowUploadForm(true);
      }
    } catch (err) {
      console.error('Failed to fetch resume', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchExistingResume();
  }, []);

  useEffect(() => {
    if (!result) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (targetJobId) {
            navigate(`/career?job_id=${targetJobId}`);
          } else {
            navigate('/candidate/profile');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result, navigate, targetJobId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/candidate/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setShowUploadForm(false);
      fetchExistingResume();
    } catch (err) {
      setError(err.response?.data?.detail || 'Resume upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Resume Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your PDF or DOCX resume — AI extracts your skills and auto-fills your profile.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {fetching ? (
        <div className="text-center py-16 text-slate-400 font-semibold">Checking resume status...</div>
      ) : (
        <>
          {/* ── Success Banner ─────────────────────── */}
          {result && (
            <div className="glass-card p-6 rounded-3xl border border-emerald-300 bg-emerald-50/50 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Resume Processed Successfully!</p>
                    <p className="text-xs text-slate-600">Your profile has been auto-filled with the extracted details.</p>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-50 flex items-center justify-center">
                    <span className="text-base font-extrabold text-blue-700">{countdown}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Redirecting</p>
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Skills Extracted
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.extracted_skills?.map((s, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/candidate/profile')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                Go to Profile Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Existing Resume Card ───────────────────────────────── */}
          {existingResume && !showUploadForm && !result && (
            <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-5 bg-white border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                      <CheckCircle className="w-3 h-3" /> Active Resume
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{existingResume.file_name}</h3>
                    <p className="text-xs text-slate-400">
                      Uploaded on {new Date(existingResume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={existingResume.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4 text-blue-600" /> Download
                  </a>
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Replace
                  </button>
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Extracted Skills:
                  </span>
                  <span className="text-purple-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {existingResume.extracted_experience_years} Yrs Exp
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {existingResume.extracted_skills?.map((s, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Upload Form ────────────────────────────────────────── */}
          {(showUploadForm || !existingResume) && !result && (
            <form onSubmit={handleUpload} className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 bg-white border border-slate-200 shadow-sm text-center">
              {existingResume && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancel and keep current resume
                  </button>
                </div>
              )}

              <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 transition space-y-3">
                <Upload className="w-10 h-10 text-blue-600 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Upload Your Resume</p>
                  <p className="text-xs text-slate-500">PDF or DOCX supported (Max 5MB)</p>
                </div>
                <input
                  required
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {file && <p className="text-xs font-bold text-emerald-600">Selected: {file.name}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading
                  ? 'Extracting Skills & Auto-filling Profile...'
                  : <><Cpu className="w-4 h-4" /> Upload &amp; Auto-fill Profile</>
                }
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
