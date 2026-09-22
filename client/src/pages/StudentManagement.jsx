import React, { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { studentAPI } from '../services/api';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('add-student');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    roomNumber: '',
    department: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await studentAPI.add(formData);
      if (response.success) {
        window.showNotification('Student added successfully!');
        setFormData({ name: '', rollNumber: '', email: '', roomNumber: '', department: '', phoneNumber: '' });
        fetchStudents();
      }
    } catch (error) {
      window.showNotification('Failed to add student');
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Student Management</h2>
        <span>Manage student information and details</span>
      </div>
      
      <div className="student-form">
        <h3>Add New Student</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentName">Student Name</label>
            <input 
              type="text" 
              id="studentName" 
              className="form-control" 
              placeholder="Enter student name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentRoll">Roll Number</label>
            <input 
              type="text" 
              id="studentRoll" 
              className="form-control" 
              placeholder="e.g., 23CB001" 
              required 
              value={formData.rollNumber}
              onChange={e => setFormData({...formData, rollNumber: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentEmail">Email</label>
            <input 
              type="email" 
              id="studentEmail" 
              className="form-control" 
              placeholder="student@drngpit.ac.in" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentRoom">Room Number</label>
            <input 
              type="text" 
              id="studentRoom" 
              className="form-control" 
              placeholder="e.g., 101" 
              required 
              value={formData.roomNumber}
              onChange={e => setFormData({...formData, roomNumber: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentDepartment">Department</label>
            <input 
              type="text" 
              id="studentDepartment" 
              className="form-control" 
              placeholder="e.g., CSE" 
              required 
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentPhone">Phone Number</label>
            <input 
              type="tel" 
              id="studentPhone" 
              className="form-control" 
              placeholder="10-digit number" 
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <UserPlus size={16} style={{ marginRight: '8px' }} /> {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
      
      <h3 style={{ marginTop: '30px' }}>Student List</h3>
      <div className="form-group" style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search students by name or roll number..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      </div>
      
      <div className="student-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', gridColumn: '1 / -1'}}>No students found.</p>
        ) : (
          filteredStudents.map(student => (
            <div key={student._id} className="card" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{student.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.rollNumber}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: '5px' }}><strong>Room:</strong> {student.roomNumber || 'Not assigned'}</div>
                <div style={{ marginBottom: '5px' }}><strong>Dept:</strong> {student.department}</div>
                <div><strong>Email:</strong> {student.email}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
