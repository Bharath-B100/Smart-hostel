import React, { useState, useEffect } from 'react';
import { Users, Utensils, Bed, UserCheck, Calendar, ClipboardList, AlertCircle, CalendarCheck, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, reportsAPI, attendanceAPI } from '../services/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    roomsAvailable: 0,
    todaysIssues: 0,
    presentToday: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, reportsRes, attendanceRes] = await Promise.all([
          studentAPI.getAll().catch(() => ({ data: [] })),
          reportsAPI.getAll().catch(() => ({ data: [] })),
          attendanceAPI.getAll().catch(() => ({ data: [] }))
        ]);
        
        const studentsCount = studentsRes?.data?.length || 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todaysIssues = (reportsRes?.data || []).filter(r => 
          r.status !== 'resolved' && r.createdAt?.startsWith(today)
        ).length;
        
        const presentToday = (attendanceRes?.data || []).filter(a => 
          a.date?.startsWith(today) && a.status === 'present'
        ).length;
        
        setStats({
          totalStudents: studentsCount,
          roomsAvailable: Math.max(0, 100 - studentsCount),
          todaysIssues,
          presentToday
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Dashboard</h2>
        <span>{currentDate}</span>
      </div>
      
      {/* Enhanced Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <Users size={24} />
          <h3>{stats.totalStudents}</h3>
          <p>Total Students</p>
        </div>
        <div className="dashboard-card">
          <Utensils size={24} />
          <h3>4.5/5</h3>
          <p>Mess Rating</p>
        </div>
        <div className="dashboard-card">
          <Bed size={24} />
          <h3>{stats.roomsAvailable}%</h3>
          <p>Room Occupancy</p>
        </div>
        <div className="dashboard-card">
          <UserCheck size={24} />
          <h3>{stats.presentToday > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0}%</h3>
          <p>Attendance Rate</p>
        </div>
      </div>
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
        <div className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>Announcements</div>
        <div className={`tab ${activeTab === 'quick-links' ? 'active' : ''}`} onClick={() => setActiveTab('quick-links')}>Quick Links</div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="tab-content active">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <h3>Recent Activity</h3>
              <div className="feedback-list">
                <p style={{color: 'var(--text-secondary)'}}>No recent activity</p>
              </div>
            </div>
            <div>
              <h3>Upcoming Events</h3>
              <div className="feedback-list">
                <p style={{color: 'var(--text-secondary)'}}>No upcoming events</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'announcements' && (
        <div className="tab-content active">
          <h3>Latest Announcements</h3>
          <div className="feedback-list">
            <p style={{color: 'var(--text-secondary)'}}>No announcements yet</p>
          </div>
        </div>
      )}
      
      {activeTab === 'quick-links' && (
        <div className="tab-content active">
          <h3>Quick Access</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/mess-feedback')}>
              <Utensils size={48} style={{ color: 'var(--primary)', marginBottom: '15px' }} />
              <h3>Mess Feedback</h3>
              <p>Submit feedback about hostel mess</p>
            </div>
            <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/leave-application')}>
              <Calendar size={48} style={{ color: 'var(--secondary)', marginBottom: '15px' }} />
              <h3>Leave Application</h3>
              <p>Apply for leave and track status</p>
            </div>
            <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/reports')}>
              <ClipboardList size={48} style={{ color: 'var(--warning)', marginBottom: '15px' }} />
              <h3>Hostel Reports</h3>
              <p>Report issues and problems</p>
            </div>
            <div className="card admin-only-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/attendance')}>
              <UserCheck size={48} style={{ color: 'var(--accent)', marginBottom: '15px' }} />
              <h3>Attendance</h3>
              <p>Mark and view attendance</p>
            </div>
            <div className="card admin-only-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/students')}>
              <Users size={48} style={{ color: 'var(--success)', marginBottom: '15px' }} />
              <h3>Student Management</h3>
              <p>Manage student records</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;