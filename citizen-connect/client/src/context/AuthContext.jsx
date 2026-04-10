import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode] = useState(localStorage.getItem('cc_demo_mode') === 'true');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        // Not logged in — clear local storage
        localStorage.removeItem('cc_token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('cc_token', token);
    localStorage.removeItem('cc_demo_mode');
    localStorage.removeItem('cc_demo_role');
    setUser(user);
    return user;
  };

  const register = async (name, email, password, role, specialization) => {
    const res = await api.post('/auth/register', { name, email, password, role, specialization });
    const { token, user } = res.data;
    localStorage.setItem('cc_token', token);
    setUser(user);
    return user;
  };

  const loginAsDemo = (role) => {
    localStorage.setItem('cc_demo_mode', 'true');
    localStorage.setItem('cc_demo_role', role);
    localStorage.removeItem('cc_token');
    setUser({
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      email: `demo_${role}@demo.com`,
      specialization: 'general_worker',
      workerEarnings: 0,
      completedJobsCount: 0,
    });
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_demo_mode');
    localStorage.removeItem('cc_demo_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, demoMode, login, register, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
