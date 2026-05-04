import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <AlertTriangle size={40} color="#DC2626" />
      </div>
      <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 800, color: '#0F172A', marginBottom: '8px', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#334155', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: '#64748B', maxWidth: '400px', marginBottom: '32px', fontSize: '1.1rem' }}>
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: '100px', fontWeight: 600 }}>
        <Home size={18} style={{ marginRight: '8px' }} />
        Back to Home
      </Link>
    </div>
  );
}
