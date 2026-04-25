import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hostelType, setHostelType] = useState<'boys' | 'girls' | null>(null);
  const [hostelName, setHostelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!hostelType || !hostelName) {
      alert('Please select hostel type and name');
      return;
    }

    if (!email.endsWith('@drngpit.ac.in')) {
      alert('Please use your college email ID (@drngpit.ac.in)');
      return;
    }

    setIsLoading(true);
    await login(email, password, false);
    setIsLoading(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="college-logo">
          <i className="fas fa-home"></i>
        </div>
        <h2>Smart Hostel Management</h2>
        <p>Dr N.G.P IT</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your college email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="hostel-type">
            <button
              type="button"
              className={`hostel-option boys-option ${hostelType === 'boys' ? 'selected' : ''}`}
              onClick={() => setHostelType('boys')}
              data-type="boys"
            >
              Boys Hostel
            </button>
            <button
              type="button"
              className={`hostel-option girls-option ${hostelType === 'girls' ? 'selected' : ''}`}
              onClick={() => setHostelType('girls')}
              data-type="girls"
            >
              Girls Hostel
            </button>
          </div>

          {hostelType && (
            <div className="form-group">
              <label htmlFor="hostelName">Select Hostel</label>
              <select
                id="hostelName"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                required
              >
                <option value="">Select Hostel</option>
                {hostelType === 'boys' ? (
                  <>
                    <option value="Marutham Hostel">Marutham Hostel</option>
                    <option value="Kurinji Hostel">Kurinji Hostel</option>
                    <option value="Neithal Hostel">Neithal Hostel</option>
                  </>
                ) : (
                  <>
                    <option value="Mullai Hostel">Mullai Hostel</option>
                    <option value="Palai Hostel">Palai Hostel</option>
                    <option value="Kaanum Hostel">Kaanum Hostel</option>
                  </>
                )}
              </select>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Login
              </>
            )}
          </button>

          <div className="admin-login-link">
            <button type="button" onClick={() => navigate('/admin-login')}>
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
