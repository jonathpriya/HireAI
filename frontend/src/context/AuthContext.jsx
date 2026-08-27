import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Token validation failed", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    setUser({
      id: res.data.user_id,
      email: res.data.email,
      full_name: res.data.full_name,
      role: res.data.role,
      profile_pic_url: res.data.profile_pic_url || null,
    });
    return res.data;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('token', res.data.access_token);
    setUser({
      id: res.data.user_id,
      email: res.data.email,
      full_name: res.data.full_name,
      role: res.data.role,
      profile_pic_url: res.data.profile_pic_url || null,
    });
    return res.data;
  };

  const updateUser = (fields) => {
    setUser(prev => prev ? { ...prev, ...fields } : fields);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);
