import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { JobsPage } from './pages/Jobs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/jobs" replace />} />
          <Route path="jobs" element={<JobsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
