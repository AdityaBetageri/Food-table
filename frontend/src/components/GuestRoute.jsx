import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GuestRoute — wraps routes that should ONLY be shown to
 * unauthenticated users (login, register).
 * If the user IS already logged in (valid cookie/token), they are
 * immediately redirected to /dashboard.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While AuthContext is still verifying the token, show a loading spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(93,173,226,0.2)',
          borderTopColor: '#5DADE2',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isAuthenticated) {
    // If there's a saved "from" location, go back there; otherwise dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}
