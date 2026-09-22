import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getDepartment = (email) => {
    if (!email) return 'N/A';
    const match = email.match(/^\d{2}(it|cb|cs|sc|bm)/i);
    if (!match) return 'N/A';
    const code = match[1].toLowerCase();
    const depts = { it: 'IT', cb: 'CSBS', cs: 'Computer Science', sc: 'Cyber Security', bm: 'BME' };
    return depts[code] || 'N/A';
  };

  return (
    <div className="tab-content active">
      <div className="section-title">
        <h2>Settings</h2>
        <span>Manage your account preferences</span>
      </div>
      
      <div className="settings-section">
        <h3>Profile Settings</h3>
        <div className="profile-picture-upload">
          <div className="profile-picture">{currentUser?.name?.charAt(0) || 'U'}</div>
          <div>
            <p><strong>Change Profile Picture</strong></p>
            <input type="file" accept="image/*" style={{ marginBottom: '10px' }} />
            <button className="btn btn-primary" onClick={() => window.showNotification('Picture uploaded')}>Upload Picture</button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input type="text" className="form-control" id="displayName" placeholder="Enter your display name" defaultValue={currentUser?.name || ''} />
        </div>
        
        <div className="form-group">
          <label htmlFor="roomNumber">Room Number</label>
          <input type="text" className="form-control" id="roomNumber" placeholder="Enter your room number" defaultValue={currentUser?.room || ''} />
        </div>

        {!currentUser?.isAdmin && (
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input type="text" className="form-control" id="department" value={getDepartment(currentUser?.email)} disabled style={{ backgroundColor: '#f5f5f5' }} />
          </div>
        )}
        
        <button className="btn btn-primary" onClick={() => window.showNotification('Profile saved')}>Save Profile Changes</button>
      </div>
      
      <div className="settings-section">
        <h3>Account Actions</h3>
        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;