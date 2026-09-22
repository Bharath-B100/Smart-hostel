import React, { useState, useEffect } from 'react';
import { Save, Check, X } from 'lucide-react';
import { attendanceAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser?.isAdmin ? 'mark-attendance' : 'attendance-records');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceMonth, setAttendanceMonth] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'morning'
  });
  const [attendanceState, setAttendanceState] = useState({}); // { studentId: 'present' | 'absent' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mark-attendance' && currentUser?.isAdmin) {
      fetchStudents();
    } else if (activeTab === 'attendance-records') {
      fetchRecords();
    }
  }, [activeTab, currentUser]);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.success) {
        setStudents(response.data || []);
        // Initialize all as present
        const initialStates = {};
        (response.data || []).forEach(s => {
          initialStates[s._id] = 'present';
        });
        setAttendanceState(initialStates);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await attendanceAPI.getAll();
      if (response.success) {
        setAttendanceRecords(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch attendance records", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser?.isAdmin) return;
    setLoading(true);
    
    // Format the bulk request based on the API structure
    // We assume we send individual records or the API handles an array.
    // Let's send an array if the backend supports it, or iterate
    const records = students.map(student => ({
      studentId: student._id,
      date: formData.date,
      type: formData.type,
      status: attendanceState[student._id]
    }));
    
    try {
      // Simplistic approach: send the first one, or loop. The old app.js likely sent individually or bulk
      // We will loop and send individually since we don't know if the backend handles bulk natively
      for (const record of records) {
        await attendanceAPI.mark(record);
      }
      window.showNotification('Attendance saved successfully!');
    } catch (error) {
      window.showNotification('Failed to save attendance');
    }
    setLoading(false);
  };

  const toggleStatus = (studentId) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Attendance System</h2>
        <span>Track student attendance and presence</span>
      </div>
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'mark-attendance' ? 'active' : ''}`} onClick={() => setActiveTab('mark-attendance')}>Mark Attendance</div>
        <div className={`tab ${activeTab === 'attendance-records' ? 'active' : ''}`} onClick={() => setActiveTab('attendance-records')}>Attendance Records</div>
      </div>
      
      {activeTab === 'mark-attendance' && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>Mark Today's Attendance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Select Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Attendance Type</label>
                <select 
                  className="form-control"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="morning">Morning Roll Call</option>
                  <option value="evening">Evening Roll Call</option>
                  <option value="night">Night Check</option>
                </select>
              </div>
            </div>
            
            <h4>Student List</h4>
            <div className="student-list">
              {students.length === 0 ? (
                <p style={{color: 'var(--text-secondary)'}}>No students found.</p>
              ) : (
                students.map(student => (
                  <div key={student._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '15px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <strong style={{ display: 'block' }}>{student.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room {student.roomNumber || 'N/A'}</span>
                    </div>
                    
                    <button 
                      onClick={() => toggleStatus(student._id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        padding: '8px 15px', 
                        borderRadius: '20px', 
                        border: 'none', 
                        cursor: 'pointer',
                        background: attendanceState[student._id] === 'present' ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                        color: attendanceState[student._id] === 'present' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold'
                      }}
                    >
                      {attendanceState[student._id] === 'present' ? (
                        <><Check size={16} /> Present</>
                      ) : (
                        <><X size={16} /> Absent</>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button className="btn btn-success" onClick={handleSave} disabled={loading} style={{ marginTop: '20px', width: '100%' }}>
              <Save size={16} style={{ marginRight: '8px' }} /> {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'attendance-records' && (
        <div className="tab-content active">
          <h3>Attendance Records</h3>
          <div className="form-group">
            <input 
              type="month" 
              className="form-control" 
              style={{ maxWidth: '200px' }} 
              value={attendanceMonth}
              onChange={e => setAttendanceMonth(e.target.value)}
            />
          </div>
          <div className="student-list">
            {attendanceRecords.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No records available.</p>
            ) : (
              attendanceRecords.map(record => (
                <div key={record._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{record.student?.name || 'Unknown Student'}</strong>
                    <span style={{ 
                      color: record.status === 'present' ? 'var(--success)' : 'var(--danger)', 
                      textTransform: 'capitalize',
                      fontWeight: 'bold'
                    }}>
                      {record.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    {new Date(record.date).toLocaleDateString()} • <span style={{ textTransform: 'capitalize' }}>{record.type}</span>
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

export default Attendance;