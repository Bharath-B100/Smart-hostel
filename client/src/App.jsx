import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MessFeedback from './pages/MessFeedback';
import LeaveApplication from './pages/LeaveApplication';
import HostelReports from './pages/HostelReports';
import RoomManagement from './pages/RoomManagement';
import Attendance from './pages/Attendance';
import Visitors from './pages/Visitors';
import Payments from './pages/Payments';
import StudentManagement from './pages/StudentManagement';
import Settings from './pages/Settings';
import Help from './pages/Help';

import './assets/css/style.css';
import './assets/css/premium.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';

export const showNotification = (message, type = 'success') => {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  } else {
    alert(message);
  }
};

window.showNotification = showNotification; // Make globally accessible

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  useEffect(() => {
    // Hide loading screen after 0.4 seconds (400ms)
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 400);
  }, []);
  return (
    <AuthProvider>
      <div className="glass-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes wrapped in Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mess-feedback" element={<MessFeedback />} />
            <Route path="leave-application" element={<LeaveApplication />} />
            <Route path="reports" element={<HostelReports />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
