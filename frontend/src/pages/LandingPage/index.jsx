import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Root route handler:
 * - Authenticated users → Dashboard
 * - Unauthenticated users → Login page
 */
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // If logged in, go to dashboard. Otherwise, go to login.
  // The static landing page at /index.html handles marketing pages.
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}