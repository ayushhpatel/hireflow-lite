import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { JobsPage } from './pages/Jobs';
import { PipelineBoard } from './pages/PipelineBoard';
import { CandidatesPage } from './pages/Candidates';
import { CandidateDetail } from './pages/CandidateDetail';
import { CareersPage } from './pages/Careers';
import { JobApplyPage } from './pages/JobApply';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Public Routes */}
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:jobId" element={<JobApplyPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/jobs" replace />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobId/board" element={<PipelineBoard />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
