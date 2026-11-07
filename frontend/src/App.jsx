import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentPortal from './pages/StudentPortal';
import AdminPortal from './pages/AdminPortal';
import Chatbot from './pages/Chatbot';
import Employers from './pages/Employers';
import ResumeBuilder from './pages/ResumeBuilder';
import Settings from './pages/Settings';
import AptitudeTest from './pages/AptitudeTest';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudyPlan from './pages/StudyPlan';
import MockInterview from './pages/MockInterview';
import Certificate from './pages/Certificate';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('aiCampusUser'));
  } catch {
    return null;
  }
};

const getLandingRoute = (user) => {
  if (!user) return '/login';
  return user.role?.toLowerCase() === 'admin' ? '/admin' : '/student';
};

const AppRoutes = () => {
  const location = useLocation();
  const user = getStoredUser();
  const isAuthPage = ['/login', '/register', '/forgot'].includes(location.pathname);

  if (isAuthPage) {
    if (user) {
      return <Navigate to={getLandingRoute(user)} replace />;
    }

    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={getLandingRoute(user)} replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/employers" element={<Employers />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/aptitude-test" element={<AptitudeTest />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/certificate" element={<Certificate />} />
        {/* Admin route guard: only Admin role users can access /admin */}
        <Route
          path="/admin"
          element={
            user?.role?.toLowerCase() === 'admin'
              ? <AdminPortal />
              : <Navigate to={getLandingRoute(user)} replace />
          }
        />
        <Route path="*" element={<Navigate to={getLandingRoute(user)} replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  React.useEffect(() => {
    // Apply saved dark mode preference on mount
    try {
      const prefs = JSON.parse(localStorage.getItem('aiCampusPreferences') || '{}');
      if (prefs.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
