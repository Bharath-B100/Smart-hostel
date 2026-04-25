import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="app">
      <Header />
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Dr N.G.P IT - Smart Hostel Management</h3>
              <p>Streamlining hostel operations for better student experience</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/mess">Mess Feedback</a></li>
                <li><a href="/leaves">Leave Application</a></li>
                <li><a href="/help">Help & Support</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact</h3>
              <p>Email: hostel@drngpit.ac.in</p>
              <p>Phone: +91 1234567890</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Dr N.G.P IT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
