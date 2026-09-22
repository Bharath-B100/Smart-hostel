import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return currentUser?.isAdmin ? (
    <aside className="sidebar">
      <div className="sidebar-section">
          <h3>Today's Stats</h3>
          <div className="stats">
            <div className="stat-item">
              <span>Pending Leaves</span>
              <span className="stat-value" id="pendingLeaves">0</span>
            </div>
            <div className="stat-item">
              <span>Mess Feedback</span>
              <span className="stat-value" id="totalFeedback">0</span>
            </div>
            <div className="stat-item">
              <span>Hostel Reports</span>
              <span className="stat-value" id="totalReports">0</span>
            </div>
            {/* NEW STATS */}
            <div className="stat-item">
              <span>Room Occupancy</span>
              <span className="stat-value" id="roomOccupancy">0%</span>
            </div>
            <div className="stat-item">
              <span>Today's Attendance</span>
              <span className="stat-value" id="todayAttendance">0%</span>
            </div>
          </div>
        </div>
    </aside>
  ) : null;
};

export default Sidebar;
