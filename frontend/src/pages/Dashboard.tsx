import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.name}!</h2>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <h3>Total Students</h3>
            <p>245</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-door-open"></i>
            <h3>Available Rooms</h3>
            <p>32</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar-alt"></i>
            <h3>Pending Leaves</h3>
            <p>12</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-file-alt"></i>
            <h3>Reports</h3>
            <p>5</p>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h3>Recent Announcements</h3>
            <div className="announcement-list">
              <div className="announcement-item">
                <span className="announcement-type info">Info</span>
                <p>Power cut notice this Saturday from 10 AM to 4 PM</p>
                <small>Oct 28, 2023</small>
              </div>
              <div className="announcement-item">
                <span className="announcement-type warning">Warning</span>
                <p>Water supply interruption on Friday from 10 AM to 12 PM</p>
                <small>Oct 27, 2023</small>
              </div>
              <div className="announcement-item">
                <span className="announcement-type important">Important</span>
                <p>Last date for hostel fee payment is 30th October</p>
                <small>Oct 25, 2023</small>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <a href="/mess" className="action-card">
                <i className="fas fa-utensils"></i>
                <span>Mess Feedback</span>
              </a>
              <a href="/leaves" className="action-card">
                <i className="fas fa-calendar-alt"></i>
                <span>Apply Leave</span>
              </a>
              <a href="/reports" className="action-card">
                <i className="fas fa-file-alt"></i>
                <span>Report Issue</span>
              </a>
              {user?.isAdmin && (
                <a href="/students" className="action-card">
                  <i className="fas fa-users"></i>
                  <span>Manage Students</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
