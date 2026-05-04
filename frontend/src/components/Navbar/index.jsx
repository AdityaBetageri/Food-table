import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <UtensilsCrossed size={24} style={{ color: '#2E86C1' }} />
        <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#1B4F72' }}>
          Table<span style={{ color: '#2E86C1' }}>Tap</span>
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <span style={{ fontSize: '14px', color: '#4A5568' }}>{user?.name}</span>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}