import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/mess-feedback', label: 'Mess Feedback', icon: 'fas fa-utensils' },
    { path: '/leave-application', label: 'Leave Application', icon: 'fas fa-calendar-alt' },
    { path: '/reports', label: 'Hostel Reports', icon: 'fas fa-clipboard-list' },
    ...(currentUser?.isAdmin ? [
      { path: '/students', label: 'Student Management', icon: 'fas fa-users' },
      { path: '/rooms', label: 'Room Management', icon: 'fas fa-bed' },
    ] : []),
    { path: '/attendance', label: 'Attendance', icon: 'fas fa-user-check' },
    { path: '/visitors', label: 'Visitors', icon: 'fas fa-user-friends' },
    { path: '/payments', label: 'Payments', icon: 'fas fa-rupee-sign' },
    { path: '/settings', label: 'Settings', icon: 'fas fa-cog' },
    { path: '/help', label: 'Help', icon: 'fas fa-question-circle' },
  ];

  return (
    <>
      <header>
        <div className="container">
          <div className="header-content">
            <div className="college-header">
              <i className="fas fa-home"></i>
              <h1>Dr N.G.P IT - Smart Hostel Management</h1>
            </div>
            <div className="user-info">
              <button 
                className="mobile-menu-toggle" 
                aria-label="Toggle mobile menu" 
                aria-expanded={showMobileMenu}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <div className="user-avatar" aria-hidden="true">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-toggle" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span>{currentUser?.name || 'Loading...'}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className={`user-dropdown-menu ${showProfileMenu ? 'show' : ''}`} style={{ display: showProfileMenu ? 'block' : 'none' }}>
                  <NavLink to="/settings" onClick={() => setShowProfileMenu(false)}>
                    <i className="fas fa-cog"></i> Settings
                  </NavLink>
                  <NavLink to="/help" onClick={() => setShowProfileMenu(false)}>
                    <i className="fas fa-question-circle"></i> Help
                  </NavLink>
                  <div className="dropdown-divider"></div>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              </div>
              {currentUser?.isAdmin ? (
                <div className="warden-info">Administrator</div>
              ) : (
                <div className="warden-info">Room: {currentUser?.roomNumber || 'N/A'}</div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <nav aria-label="Main navigation">
        <div className="container">
          <ul className={`nav-links ${showMobileMenu ? 'active' : ''}`} role="menubar">
            {navLinks.map((link) => (
              <li key={link.path} role="none">
                <NavLink 
                  to={link.path} 
                  className={({ isActive }) => isActive ? 'active' : ''}
                  role="menuitem"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className={link.icon}></i> {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;
