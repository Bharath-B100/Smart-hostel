import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Navigation = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', show: true },
    { path: '/mess', label: 'Mess Feedback', icon: 'fa-utensils', show: true },
    { path: '/leaves', label: 'Leave Application', icon: 'fa-calendar-alt', show: true },
    { path: '/students', label: 'Students', icon: 'fa-users', show: user?.isAdmin || false },
    { path: '/reports', label: 'Reports', icon: 'fa-file-alt', show: true },
    { path: '/rooms', label: 'Rooms', icon: 'fa-door-open', show: user?.isAdmin || false },
    { path: '/attendance', label: 'Attendance', icon: 'fa-clipboard-check', show: user?.isAdmin || false },
    { path: '/visitors', label: 'Visitors', icon: 'fa-user-friends', show: true },
    { path: '/payments', label: 'Payments', icon: 'fa-credit-card', show: user?.isAdmin || false },
    { path: '/settings', label: 'Settings', icon: 'fa-cog', show: true },
    { path: '/help', label: 'Help', icon: 'fa-question-circle', show: true },
  ];

  if (!isAuthenticated) return null;

  return (
    <nav aria-label="Main navigation">
      <div className="container">
        <ul className="nav-links" role="menubar">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <li key={item.path} role="none">
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  role="menuitem"
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <i className={`fas ${item.icon}`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
