import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TOKEN_KEY = 'urbanthread_token';
const USER_KEY = 'urbanthread_user';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Set up global axios request interceptor for Authorization header
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Validate token and fetch fresh user profile on initial mount
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (res.data && res.data.success && res.data.data?.user) {
        const freshUser = res.data.data.user;
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      } else {
        throw new Error('Invalid user response');
      }
    } catch (err) {
      console.warn('Session expired or invalid token; logging out:', err.response?.data?.message || err.message);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Log in customer with email and password
   */
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data && res.data.success && res.data.data) {
        const { user: loggedInUser, token: authToken } = res.data.data;
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
        setToken(authToken);
        setUser(loggedInUser);
        return { success: true, user: loggedInUser };
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to log in. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * Register a new customer
   */
  const register = async ({ name, email, password, phone }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        phone,
      });

      if (res.data && res.data.success && res.data.data) {
        const { user: registeredUser, token: authToken } = res.data.data;
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(registeredUser));
        setToken(authToken);
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to create account. Please try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Log out customer
   */
  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Error removing token from storage:', err);
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
