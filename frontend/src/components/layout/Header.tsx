import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <header className="header">
      <div className="header-content">
        <div className="college-header">
          <i className="fas fa-home"></i>
          <h1>Dr N.G.P IT - Smart Hostel Management</h1>
        </div>
        {isAuthenticated && user && (
          <div className="user-info">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-dropdown">
              <button className="user-dropdown-toggle">
                <span>
                  {user.name}
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                </span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <div className="user-dropdown-menu">
                <Link to="/settings">
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <Link to="/help">
                  <i className="fas fa-question-circle"></i> Help
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={logout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
            <button className="theme-toggle">
              <i className="fas fa-moon"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
