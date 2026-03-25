import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold text-slate-900">Dashboard</h1><p className="text-slate-500">Welcome to HireFlow Lite. You are successfully authenticated!</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
