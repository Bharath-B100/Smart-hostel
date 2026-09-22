import React, { useState, useEffect } from 'react';
import { Send, AlertTriangle, CheckCircle, Clock, Check } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HostelReports = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser?.isAdmin ? 'manage-reports' : 'report-issue');
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    urgency: 'low'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-reports') {
      fetchReports();
    } else if (activeTab === 'manage-reports' && currentUser?.isAdmin) {
      fetchAllReports();
    }
  }, [activeTab, currentUser]);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getMyReports();
      if (response.success) {
        setReports(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  const fetchAllReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      if (response.success) {
        setAllReports(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch all reports", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await reportsAPI.update(id, { status });
      if (response.success) {
        window.showNotification(`Report marked as ${status}!`);
        fetchAllReports();
      }
    } catch (error) {
      window.showNotification('Failed to update report status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await reportsAPI.submit({
        ...formData,
        date: new Date().toISOString()
      });
      
      if (response.success) {
        window.showNotification('Issue reported successfully!');
        setFormData({ category: '', location: '', description: '', urgency: 'low' });
        setActiveTab('my-reports');
      }
    } catch (error) {
      window.showNotification('Failed to report issue');
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle size={16} color="var(--success)" />;
      default: return <Clock size={16} color="var(--warning)" />;
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Hostel Reports & Issues</h2>
        <span>Report maintenance issues and track resolution</span>
      </div>
      
      <div className="tabs">
        {!currentUser?.isAdmin && <div className={`tab ${activeTab === 'report-issue' ? 'active' : ''}`} onClick={() => setActiveTab('report-issue')}>Report Issue</div>}
        {!currentUser?.isAdmin && <div className={`tab ${activeTab === 'my-reports' ? 'active' : ''}`} onClick={() => setActiveTab('my-reports')}>My Reports</div>}
        {currentUser?.isAdmin && (
          <div className={`tab ${activeTab === 'manage-reports' ? 'active' : ''}`} onClick={() => setActiveTab('manage-reports')}>Manage Reports</div>
        )}
      </div>
      
      {activeTab === 'report-issue' && !currentUser?.isAdmin && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>Report New Issue</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="issueCategory">Category</label>
                <select 
                  className="form-control" 
                  id="issueCategory" 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="cleaning">Cleaning/Housekeeping</option>
                  <option value="internet">Internet/WiFi</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="issueLocation">Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="issueLocation" 
                  placeholder="e.g., Room 101, Common Washroom (2nd Floor)" 
                  required 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="issueDescription">Description</label>
                <textarea 
                  className="form-control" 
                  id="issueDescription" 
                  placeholder="Please describe the issue in detail..." 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="issueUrgency">Urgency Level</label>
                <select 
                  className="form-control" 
                  id="issueUrgency"
                  value={formData.urgency}
                  onChange={e => setFormData({...formData, urgency: e.target.value})}
                >
                  <option value="low">Low - Can be fixed in a few days</option>
                  <option value="medium">Medium - Needs attention soon</option>
                  <option value="high">High - Requires immediate attention</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-warning" disabled={loading}>
                <AlertTriangle size={16} style={{ marginRight: '8px' }} /> {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'my-reports' && !currentUser?.isAdmin && (
        <div className="tab-content active">
          <h3>My Issue Reports</h3>
          <div className="student-list">
            {reports.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No reports found.</p>
            ) : (
              reports.map((report, i) => (
                <div className="report-item" key={report._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{report.category} Issue - {report.location}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'capitalize' }}>
                      {getStatusIcon(report.status)} {report.status || 'pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Urgency: <span style={{ textTransform: 'capitalize', color: report.urgency === 'high' ? 'var(--danger)' : (report.urgency === 'medium' ? 'var(--warning)' : 'inherit') }}>{report.urgency}</span> • {new Date(report.createdAt || report.date).toLocaleDateString()}
                  </div>
                  <p>{report.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage-reports' && currentUser?.isAdmin && (
        <div className="tab-content active">
          <h3>Manage Hostel Reports</h3>
          <div className="student-list">
            {allReports.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No issue reports found.</p>
            ) : (
              allReports.map((report, i) => (
                <div className="report-item" key={report._id || i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{report.email || report.user}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Reported <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{report.category}</span> issue at {report.location}
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {getStatusIcon(report.status)} {report.status || 'pending'}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} color={report.urgency === 'high' ? 'var(--danger)' : (report.urgency === 'medium' ? 'var(--warning)' : 'inherit')} /> 
                    Urgency: <span style={{ textTransform: 'capitalize', color: report.urgency === 'high' ? 'var(--danger)' : (report.urgency === 'medium' ? 'var(--warning)' : 'inherit') }}>{report.urgency}</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    {new Date(report.createdAt || report.date).toLocaleDateString()}
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem' }}>
                    <strong>Description:</strong> {report.description}
                  </div>

                  {(!report.status || report.status !== 'resolved') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleStatusUpdate(report._id, 'resolved')} className="btn" style={{ background: 'var(--success)', color: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Mark as Resolved
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

export default HostelReports;