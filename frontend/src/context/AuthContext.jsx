import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';

const AuthContext = createContext(null);

/**
 * Creates a demo user when the backend is unavailable.
 * This lets the frontend be explored fully during development.
 */
function createDemoUser(formData) {
  return {
    token: 'demo_token_' + Date.now(),
    user: {
      _id: 'demo_' + Date.now(),
      name: formData.name || formData.email?.split('@')[0] || 'Demo User',
      email: formData.email || 'demo@tabletap.com',
      role: 'owner',
      hotelName: formData.hotelName || 'Demo Restaurant',
      city: formData.city || 'Mumbai',
      phone: formData.phone || '',
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getCookie('tabletap_token') || localStorage.getItem('tabletap_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      // Check if this is a demo token
      if (token.startsWith('demo_token_')) {
        const savedUser = localStorage.getItem('tabletap_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            removeCookie('tabletap_token');
            localStorage.removeItem('tabletap_token');
            localStorage.removeItem('tabletap_user');
            setToken(null);
          }
        }
        setLoading(false);
        return;
      }

      authAPI.getMe()
        .then((data) => setUser(data.user || data))
        .catch(() => {
          removeCookie('tabletap_token');
          localStorage.removeItem('tabletap_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      const newToken = data.token;
      setCookie('tabletap_token', newToken, 7);
      localStorage.setItem('tabletap_token', newToken); // Legacy support
      setToken(newToken);
      setUser(data.user);
      return data;
    } catch (err) {
      // Fallback to demo mode when backend is unavailable
      const msg = (err.message || '').toLowerCase();
      if (err instanceof TypeError || msg.includes('fetch') || msg.includes('network')) {
        console.warn('[TableTap] Backend unavailable — using demo mode');
        const demo = createDemoUser({ email });
        setCookie('tabletap_token', demo.token, 7);
        localStorage.setItem('tabletap_token', demo.token);
        localStorage.setItem('tabletap_user', JSON.stringify(demo.user));
        setToken(demo.token);
        setUser(demo.user);
        return demo;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const data = await authAPI.register(formData);
      // If approval is pending, don't log in — return data with status
      if (data.approvalStatus === 'pending') {
        return data; // { approvalStatus: 'pending', message: "..." }
      }
      if (data.token) {
        setCookie('tabletap_token', data.token, 7);
        localStorage.setItem('tabletap_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      // Fallback to demo mode when backend is unavailable
      const msg = (err.message || '').toLowerCase();
      if (err instanceof TypeError || msg.includes('fetch') || msg.includes('network')) {
        console.warn('[TableTap] Backend unavailable — using demo mode');
        const demo = createDemoUser(formData);
        setCookie('tabletap_token', demo.token, 7);
        localStorage.setItem('tabletap_token', demo.token);
        localStorage.setItem('tabletap_user', JSON.stringify(demo.user));
        setToken(demo.token);
        setUser(demo.user);
        return demo;
      }
      throw err;
    }
  };

  const logout = () => {
    removeCookie('tabletap_token');
    localStorage.removeItem('tabletap_token');
    localStorage.removeItem('tabletap_user');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      return await authAPI.forgotPassword({ email });
    } catch (err) {
      console.warn('[TableTap] Backend unavailable for forgot password');
      return { message: 'Password reset email sent (demo).' };
    }
  };

  const isOwner = user?.role === 'owner';
  const isChef = user?.role === 'chef';
  const isWaiter = user?.role === 'waiter';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        isOwner,
        isChef,
        isWaiter,
        isCashier,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { AuthContext };