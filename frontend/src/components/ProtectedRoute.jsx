import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If the user is NOT logged in (no valid cookie/token), they are
 * redirected to /login. The original URL is saved so they can be
 * sent back after logging in.
 */
export default function ProtectedRoute({ children }) {
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

  if (!isAuthenticated) {
    // Redirect to login, saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
