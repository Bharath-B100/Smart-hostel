import React, { useState, useEffect } from 'react';
import { Bed } from 'lucide-react';
import { roomAllocationAPI, studentAPI } from '../services/api';

const RoomManagement = () => {
  const [activeTab, setActiveTab] = useState('room-allocation');
  const [allocations, setAllocations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    roomNumber: '',
    allocationDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'room-allocation') {
      fetchAllocations();
      fetchStudents();
    } else if (activeTab === 'room-availability') {
      fetchAvailability();
    }
  }, [activeTab]);

  const fetchAllocations = async () => {
    try {
      const response = await roomAllocationAPI.getAll();
      if (response.success) setAllocations(response.data || []);
    } catch (err) {
      console.error("Failed to fetch allocations", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.success) setStudents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await roomAllocationAPI.getAvailability();
      if (response.success) setAvailability(response.data || []);
    } catch (err) {
      console.error("Failed to fetch availability", err);
    }
  };

  const handleAllocation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await roomAllocationAPI.allocate(formData);
      if (response.success) {
        window.showNotification('Room allocated successfully!');
        setFormData({ studentId: '', roomNumber: '', allocationDate: '' });
        fetchAllocations();
      }
    } catch (error) {
      window.showNotification('Failed to allocate room');
    }
    setLoading(false);
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Room Management</h2>
        <span>Manage hostel room allocation and availability</span>
      </div>
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'room-allocation' ? 'active' : ''}`} onClick={() => setActiveTab('room-allocation')}>Room Allocation</div>
        <div className={`tab ${activeTab === 'room-availability' ? 'active' : ''}`} onClick={() => setActiveTab('room-availability')}>Room Availability</div>
      </div>
      
      {activeTab === 'room-allocation' && (
        <div className="tab-content active">
          <div className="student-form">
            <h3>Allocate Room to Student</h3>
            <form onSubmit={handleAllocation}>
              <div className="form-group">
                <label htmlFor="allocateStudent">Select Student</label>
                <select 
                  className="form-control" 
                  id="allocateStudent" 
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="allocateRoom">Select Room</label>
                <select 
                  className="form-control" 
                  id="allocateRoom" 
                  required
                  value={formData.roomNumber}
                  onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                >
                  <option value="">Select Room</option>
                  {[101, 102, 103, 104, 105, 201, 202, 203].map(room => (
                    <option key={room} value={room}>Room {room}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="allocationDate">Allocation Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="allocationDate" 
                  required 
                  value={formData.allocationDate}
                  onChange={e => setFormData({...formData, allocationDate: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Bed size={16} style={{ marginRight: '8px' }} /> {loading ? 'Allocating...' : 'Allocate Room'}
              </button>
            </form>
          </div>
          
          <h3>Current Room Allocations</h3>
          <div className="student-list">
            {allocations.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No allocations found.</p>
            ) : (
              allocations.map(a => (
                <div key={a._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{a.student?.name || 'Unknown Student'}</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Room {a.roomNumber}</div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Allocated: {new Date(a.allocationDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'room-availability' && (
        <div className="tab-content active">
          <h3>Room Availability Status</h3>
          <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
            {availability.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No room data available.</p>
            ) : (
              availability.map((room, idx) => (
                <div key={idx} style={{ 
                  background: room.available ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 107, 107, 0.1)', 
                  border: `1px solid ${room.available ? 'var(--success)' : 'var(--danger)'}`,
                  padding: '20px', 
                  borderRadius: '8px', 
                  textAlign: 'center' 
                }}>
                  <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '5px' }}>{room.roomNumber}</strong>
                  <span style={{ fontSize: '0.8rem', color: room.available ? 'var(--success)' : 'var(--danger)' }}>
                    {room.available ? 'Available' : 'Occupied'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;