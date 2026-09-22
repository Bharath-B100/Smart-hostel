import React, { useState, useEffect } from 'react';
import { Send, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Check, X } from 'lucide-react';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LeaveApplication = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser?.isAdmin ? 'manage-leaves' : 'apply-leave');
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leave-history') {
      fetchLeaves();
    } else if (activeTab === 'manage-leaves' && currentUser?.isAdmin) {
      fetchAllLeaves();
    }
  }, [activeTab, currentUser]);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      if (response.success) {
        setLeaves(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const response = await leaveAPI.getAll();
      if (response.success) {
        setAllLeaves(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch all leaves", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await leaveAPI.update(id, { status });
      if (response.success) {
        window.showNotification(`Leave ${status} successfully!`);
        fetchAllLeaves();
      }
    } catch (error) {
      window.showNotification('Failed to update leave status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await leaveAPI.apply({
        type: formData.leaveType,
        from: formData.startDate,
        to: formData.endDate,
        reason: formData.reason
      });
      
      if (response.success) {
        window.showNotification('Leave application submitted successfully!');
        setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
        setActiveTab('leave-history');
      }
    } catch (error) {
      window.showNotification('Failed to submit leave application');
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color="var(--success)" />;
      case 'rejected': return <XCircle size={16} color="var(--danger)" />;
      default: return <Clock size={16} color="var(--warning)" />;
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Leave Applications</h2>
        <span>Apply for leave and track status</span>
      </div>
      
      <div className="tabs">
        {!currentUser?.isAdmin && <div className={`tab ${activeTab === 'apply-leave' ? 'active' : ''}`} onClick={() => setActiveTab('apply-leave')}>Apply for Leave</div>}
        {!currentUser?.isAdmin && <div className={`tab ${activeTab === 'leave-history' ? 'active' : ''}`} onClick={() => setActiveTab('leave-history')}>Leave History</div>}
        {currentUser?.isAdmin && (
          <div className={`tab ${activeTab === 'manage-leaves' ? 'active' : ''}`} onClick={() => setActiveTab('manage-leaves')}>Manage Leaves</div>
        )}
      </div>
      
      {activeTab === 'apply-leave' && !currentUser?.isAdmin && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>New Leave Request</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type</label>
                <select 
                  className="form-control" 
                  id="leaveType" 
                  required
                  value={formData.leaveType}
                  onChange={e => setFormData({...formData, leaveType: e.target.value})}
                >
                  <option value="">Select Leave Type</option>
                  <option value="home">Going Home</option>
                  <option value="medical">Medical Leave</option>
                  <option value="event">College Event/Duty</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="startDate">From Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="startDate" 
                    required 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">To Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="endDate" 
                    required 
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">Reason for Leave</label>
                <textarea 
                  className="form-control" 
                  id="reason" 
                  placeholder="Please provide a detailed reason..." 
                  required
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Send size={16} style={{ marginRight: '8px' }} /> {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'leave-history' && !currentUser?.isAdmin && (
        <div className="tab-content active">
          <h3>My Leave Applications</h3>
          <div className="student-list">
            {leaves.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No leave history found.</p>
            ) : (
              leaves.map((leave, i) => (
                <div className="leave-item" key={leave._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{leave.type || leave.leaveType} Leave</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'capitalize' }}>
                      {getStatusIcon(leave.status)} {leave.status || 'pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    <CalendarIcon size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {new Date(leave.from || leave.startDate).toLocaleDateString()} to {new Date(leave.to || leave.endDate).toLocaleDateString()}
                  </div>
                  <p>{leave.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage-leaves' && currentUser?.isAdmin && (
        <div className="tab-content active">
          <h3>Manage Student Leaves</h3>
          <div className="student-list">
            {allLeaves.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No leave applications found.</p>
            ) : (
              allLeaves.map((leave, i) => (
                <div className="leave-item" key={leave._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{leave.email || leave.user}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Requested a <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{leave.type || leave.leaveType}</span> leave
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {getStatusIcon(leave.status)} {leave.status || 'pending'}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarIcon size={16} /> {new Date(leave.from || leave.startDate).toLocaleDateString()} — {new Date(leave.to || leave.endDate).toLocaleDateString()}
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem' }}>
                    <strong>Reason:</strong> {leave.reason}
                  </div>

                  {(!leave.status || leave.status === 'pending') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleStatusUpdate(leave._id, 'approved')} className="btn" style={{ background: 'var(--success)', color: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(leave._id, 'rejected')} className="btn" style={{ background: 'var(--danger)', color: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <X size={18} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;