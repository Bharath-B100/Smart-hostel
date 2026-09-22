import React, { useState, useEffect } from 'react';
import { Home, Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const isStudent = activeTab === 'student';
    const currentEmail = isStudent ? email : adminEmail;
    const currentPassword = isStudent ? password : adminPassword;
    
    // Custom Validation for Students
    if (isStudent) {
      if (!currentEmail.endsWith('@drngpit.ac.in')) {
        setError('Email ID must end with @drngpit.ac.in');
        return;
      }

      if (currentEmail.length !== 21) {
        setError('Email ID must be exactly 21 characters long');
        return;
      }

      const emailPrefix = currentEmail.split('@')[0];
      if (currentPassword !== emailPrefix) {
        setError('Password must match the part before @ in the email');
        return;
      }
    }

    setLoading(true);
    
    const result = await login(currentEmail, currentPassword, !isStudent);
    
    if (result.success) {
      if (!isStudent) {
        document.body.classList.add('theme-admin');
      }
      navigate('/dashboard');
    } else {
      setError(result.message || `${isStudent ? 'Student' : 'Admin'} login failed. Please check your credentials.`);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="login-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        padding: '20px',
        background: '#ffffff'
      }}>
        <div className="login-box" style={{ 
          width: '100%',
          maxWidth: '480px', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#ffffff',
          padding: '30px 40px',
        }}>
          
          {/* Header Image */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src="/Login.avif" 
              alt="Login Illustration" 
              style={{ 
                width: '180px', 
                height: 'auto', 
                margin: '0 auto', 
                display: 'block' 
              }} 
            />
          </div>
          
          {/* Header Text */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.8rem', 
              color: '#153c15',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}>
              Dr N.G.P IT
            </h2>
            <p style={{ 
              margin: '4px 0 0', 
              color: '#153c15', 
              fontSize: '1rem',
              fontWeight: 600
            }}>
              Smart Hostel
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ 
            display: 'flex', 
            background: '#ffffff', 
            borderRadius: '30px', 
            padding: '4px', 
            marginBottom: '24px',
            border: '1px solid #eef2ec'
          }}>
            <button 
              onClick={() => { setActiveTab('student'); setError(''); }}
              style={{
                flex: 1, 
                padding: '12px', 
                border: 'none', 
                borderRadius: '30px',
                background: activeTab === 'student' ? '#98e35c' : 'transparent',
                color: activeTab === 'student' ? '#153c15' : '#9ca3af',
                fontWeight: 600, 
                cursor: 'pointer', 
                transition: 'all 0.3s ease',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <User size={18} /> Student
            </button>
            <button 
               onClick={() => { setActiveTab('admin'); setError(''); }}
               style={{
                 flex: 1, 
                 padding: '12px', 
                 border: 'none', 
                 borderRadius: '30px',
                 background: activeTab === 'admin' ? '#98e35c' : 'transparent',
                 color: activeTab === 'admin' ? '#153c15' : '#9ca3af',
                 fontWeight: 600, 
                 cursor: 'pointer', 
                 transition: 'all 0.3s ease',
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 gap: '8px',
                 fontSize: '0.9rem'
               }}
            >
              <Shield size={18} /> Admin
            </button>
          </div>
          
          {error && (
            <div style={{ 
              color: '#ef4444', 
              background: '#fef2f2', 
              padding: '12px', 
              borderRadius: '16px', 
              marginBottom: '20px', 
              fontSize: '0.9rem', 
              textAlign: 'center', 
              border: '1px solid #fecaca' 
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Field */}
            <div className="form-group" style={{ margin: 0, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ 
                  position: 'absolute', 
                  left: '18px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder={activeTab === 'student' ? "Email" : "Admin Email"} 
                  value={activeTab === 'student' ? email : adminEmail}
                  onChange={(e) => activeTab === 'student' ? setEmail(e.target.value) : setAdminEmail(e.target.value)}
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '16px 16px 16px 48px', 
                    borderRadius: '30px', 
                    background: '#ffffff',
                    border: '1px solid #e6e8e5',
                    color: '#153c15',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#98e35c'}
                  onBlur={(e) => e.target.style.borderColor = '#e6e8e5'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ 
                  position: 'absolute', 
                  left: '18px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  placeholder="Password" 
                  value={activeTab === 'student' ? password : adminPassword}
                  onChange={(e) => activeTab === 'student' ? setPassword(e.target.value) : setAdminPassword(e.target.value)}
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '16px 48px 16px 48px', 
                    borderRadius: '30px', 
                    background: '#ffffff',
                    border: '1px solid #e6e8e5',
                    color: '#153c15',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#98e35c'}
                  onBlur={(e) => e.target.style.borderColor = '#e6e8e5'}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ 
                    position: 'absolute', 
                    right: '18px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    color: '#9ca3af', 
                    cursor: 'pointer', 
                    padding: 0 
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Forgot Password */}
            <div style={{ textAlign: 'center', marginTop: '-4px', marginBottom: '4px' }}>
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#4b5563', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem', 
                  fontWeight: 500, 
                  padding: '4px',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '30px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '10px', 
                fontWeight: 600, 
                fontSize: '1rem', 
                border: 'none', 
                cursor: 'pointer',
                background: '#153c15',
                color: '#ffffff',
                transition: 'opacity 0.2s',
              }}
              disabled={loading}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 1000 
        }}>
          <div className="modal-content" style={{ 
            background: '#ffffff', 
            padding: '32px', 
            borderRadius: '30px', 
            width: '90%', 
            maxWidth: '400px', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.4rem', 
                color: '#153c15',
                fontWeight: 800
              }}>
                Reset Password
              </h2>
              <button 
                onClick={() => setShowForgotPassword(false)} 
                style={{ 
                  background: '#f2f6ee', 
                  border: 'none', 
                  color: '#153c15', 
                  cursor: 'pointer', 
                  fontSize: '1.2rem', 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('OTP sent to your email'); }}>
              <p style={{ 
                marginBottom: '20px', 
                color: '#4b5563', 
                fontSize: '0.95rem', 
                lineHeight: '1.5' 
              }}>
                Enter your registered email ID. We will send a 4-digit OTP to verify.
              </p>
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '30px', 
                    background: '#ffffff',
                    border: '1px solid #e6e8e5',
                    color: '#153c15', 
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#98e35c'}
                  onBlur={(e) => e.target.style.borderColor = '#e6e8e5'}
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '30px',
                  background: '#153c15',
                  color: '#ffffff',
                  border: 'none', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Mail size={18} /> Send OTP
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;