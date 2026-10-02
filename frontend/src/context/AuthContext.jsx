import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tryscan_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(getCookie('tryscan_token') || localStorage.getItem('tryscan_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((data) => {
          const userData = data.user || data;
          setUser(userData);
          localStorage.setItem('tryscan_user', JSON.stringify(userData));
        })
        .catch((err) => {
          // Only log out if the backend explicitly says the token is invalid (401/403)
          // This prevents logging out on fast reloads, network drops, or 500 errors
          if (err.status === 401 || err.status === 403) {
            removeCookie('tryscan_token');
            localStorage.removeItem('tryscan_token');
            localStorage.removeItem('tryscan_user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    const newToken = data.token;
    setCookie('tryscan_token', newToken, 7);
    localStorage.setItem('tryscan_token', newToken);
    localStorage.setItem('tryscan_user', JSON.stringify(data.user));
    setToken(newToken);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await authAPI.register(formData);
    // If approval is pending, don't log in — return data with status
    if (data.approvalStatus === 'pending') {
      return data; // { approvalStatus: 'pending', message: "..." }
    }
    if (data.token) {
      setCookie('tryscan_token', data.token, 7);
      localStorage.setItem('tryscan_token', data.token);
      localStorage.setItem('tryscan_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    removeCookie('tryscan_token');
    localStorage.removeItem('tryscan_token');
    localStorage.removeItem('tryscan_user');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await authAPI.forgotPassword({ email });
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