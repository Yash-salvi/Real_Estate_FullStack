import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const response = await API.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Session verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token: jwtToken, user: userProfile } = response.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error.response?.data || new Error("Login failed");
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const response = await API.post('/api/auth/register', { name, email, password, role, phone });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      hasRole,
      isAdmin: user?.role === 'ADMIN',
      isAgent: user?.role === 'AGENT',
      isBuyer: user?.role === 'BUYER',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
