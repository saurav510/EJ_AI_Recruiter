import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { login as apiLogin, register as apiRegister, getMe as apiGetMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await apiGetMe();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error('[Check Auth Error]:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success(`Account created successfully! Welcome, ${res.data.user.name}!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
