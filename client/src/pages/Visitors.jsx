import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { visitorsAPI, studentAPI } from '../services/api';

const Visitors = () => {
  const [activeTab, setActiveTab] = useState('register-visitor');
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorPurpose: '',
    studentVisiting: '',
    expectedDuration: 2
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'register-visitor') {
      fetchStudents();
    } else if (activeTab === 'visitor-records') {
      fetchVisitors();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.success) setStudents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await visitorsAPI.getAll();
      if (response.success) setVisitors(response.data || []);
    } catch (err) {
      console.error("Failed to fetch visitors", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await visitorsAPI.register({
        ...formData,
        date: new Date().toISOString()
      });
      if (response.success) {
        window.showNotification('Visitor registered successfully!');
        setFormData({
          visitorName: '',
          visitorPhone: '',
          visitorPurpose: '',
          studentVisiting: '',
          expectedDuration: 2
        });
        setActiveTab('visitor-records');
      }
    } catch (error) {
      window.showNotification('Failed to register visitor');
    }
    setLoading(false);
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Visitor Management</h2>
        <span>Manage visitor registrations and tracking</span>
      </div>
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'register-visitor' ? 'active' : ''}`} onClick={() => setActiveTab('register-visitor')}>Register Visitor</div>
        <div className={`tab ${activeTab === 'visitor-records' ? 'active' : ''}`} onClick={() => setActiveTab('visitor-records')}>Visitor Records</div>
      </div>
      
      {activeTab === 'register-visitor' && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>Register New Visitor</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="visitorName">Visitor Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="visitorName" 
                  placeholder="Enter visitor's full name" 
                  required 
                  value={formData.visitorName}
                  onChange={e => setFormData({...formData, visitorName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="visitorPhone">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="visitorPhone" 
                  placeholder="Enter phone number" 
                  required 
                  value={formData.visitorPhone}
                  onChange={e => setFormData({...formData, visitorPhone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="visitorPurpose">Purpose of Visit</label>
                <select 
                  className="form-control" 
                  id="visitorPurpose" 
                  required
                  value={formData.visitorPurpose}
                  onChange={e => setFormData({...formData, visitorPurpose: e.target.value})}
                >
                  <option value="">Select Purpose</option>
                  <option value="meeting">Meeting Student</option>
                  <option value="delivery">Delivery</option>
                  <option value="official">Official Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="studentVisiting">Student Being Visited</label>
                <select 
                  className="form-control" 
                  id="studentVisiting" 
                  required
                  value={formData.studentVisiting}
                  onChange={e => setFormData({...formData, studentVisiting: e.target.value})}
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.roomNumber || 'N/A'})</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expectedDuration">Expected Duration (hours)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="expectedDuration" 
                  min="1" 
                  max="8" 
                  required 
                  value={formData.expectedDuration}
                  onChange={e => setFormData({...formData, expectedDuration: Number(e.target.value)})}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <UserPlus size={16} style={{ marginRight: '8px' }} /> {loading ? 'Registering...' : 'Register Visitor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'visitor-records' && (
        <div className="tab-content active">
          <h3>Visitor Records</h3>
          <div className="student-list">
            {visitors.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No visitor records found.</p>
            ) : (
              visitors.map((visitor, i) => (
                <div key={visitor._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{visitor.visitorName}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{new Date(visitor.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    <strong>Purpose:</strong> <span style={{ textTransform: 'capitalize' }}>{visitor.visitorPurpose}</span> • <strong>Phone:</strong> {visitor.visitorPhone}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Visiting:</strong> {visitor.student?.name || 'Unknown'} • <strong>Duration:</strong> {visitor.expectedDuration} hrs
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;