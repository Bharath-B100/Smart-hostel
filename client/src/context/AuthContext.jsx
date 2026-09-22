import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.success) {
            setCurrentUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    try {
      const response = await authAPI.login(email, password, isAdmin);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setCurrentUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
