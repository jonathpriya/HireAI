import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppLayout from './components/AppLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Career from './pages/public/Career';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import PublicProfile from './pages/public/PublicProfile';
import Messages from './pages/shared/Messages';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import RecruiterPipeline from './pages/recruiter/RecruiterPipeline';
import RecruiterSourcing from './pages/recruiter/RecruiterSourcing';
import RecruiterIntegrations from './pages/recruiter/RecruiterIntegrations';
import ShortlistedCandidates from './pages/recruiter/ShortlistedCandidates';
import TalentPools from './pages/recruiter/TalentPools';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateJobs from './pages/candidate/CandidateJobs';
import MyProfile from './pages/candidate/MyProfile';
import ResumeUpload from './pages/candidate/ResumeUpload';
import JobInvitations from './pages/candidate/JobInvitations';
import Notifications from './pages/candidate/Notifications';
import CandidateSettings from './pages/candidate/CandidateSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Public Layout Wrapper with Top Navbar & Footer
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#f3f4f6] text-slate-800">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

// Protected Route Guard with Left Sidebar AppLayout
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center text-slate-500 font-bold">
        Loading session...
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public Routes (Top Navbar + Footer) ── */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/career" element={<PublicLayout><Career /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/in/:id" element={<PublicLayout><PublicProfile /></PublicLayout>} />
          <Route path="/messages" element={<PublicLayout><Messages /></PublicLayout>} />

          {/* ── Recruiter Routes (Left Sidebar Navigation) ── */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/talent-pools"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <TalentPools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/post-job"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/manage-jobs"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <ManageJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/pipeline"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterPipeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/sourcing"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterSourcing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/integrations"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterIntegrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/shortlisted/:jobId"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <ShortlistedCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/company-profile"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/settings"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterSettings />
              </ProtectedRoute>
            }
          />

          {/* ── Candidate Routes (Left Sidebar Navigation) ── */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRole="candidate">
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/resume-upload"
            element={
              <ProtectedRoute allowedRole="candidate">
                <ResumeUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/job-invitations"
            element={
              <ProtectedRoute allowedRole="candidate">
                <JobInvitations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/notifications"
            element={
              <ProtectedRoute allowedRole="candidate">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/settings"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateSettings />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
