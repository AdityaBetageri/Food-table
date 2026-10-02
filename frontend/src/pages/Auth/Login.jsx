import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Clock, XCircle, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null); // null | 'pending' | 'denied' | 'updated'
  const [approvalMessage, setApprovalMessage] = useState('');
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first to reset your password.');
      return;
    }
    setError('');
    setApprovalStatus(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setApprovalStatus('updated');
      setApprovalMessage(res.message || 'Password reset email sent. Please check your email');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setApprovalStatus(null);
    setLoading(true);
    try {
      await login(email, password);
      // Fast transition
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Login failed';
      // Check if the error message contains approval status info
      if (msg.includes("received your request") || msg.includes("reach you soon")) {
        setApprovalStatus('pending');
        setApprovalMessage(msg);
      } else if (msg.includes("denied") || msg.includes("access request has been denied")) {
        setApprovalStatus('denied');
        setApprovalMessage(msg);
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
      <div style={{ width: '100%', maxWidth: '420px', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <UtensilsCrossed size={32} style={{ color: '#5DADE2' }} />
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>Try<span style={{ color: '#5DADE2' }}>Scan</span></span>
          </Link>
          <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '15px' }}>Welcome back! Log in to your dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>

          {/* Status Banners */}
          {approvalStatus === 'pending' && (
            <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(243,156,18,.08), rgba(243,156,18,.03))', border: '1px solid rgba(243,156,18,.2)', animation: 'fadeInDown .4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(243,156,18,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} style={{ color: '#F39C12' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#B7770D' }}>Approval Pending</span>
              </div>
              <p style={{ fontSize: '13px', color: '#7D6608', lineHeight: 1.6, margin: 0 }}>{approvalMessage}</p>
            </div>
          )}

          {approvalStatus === 'denied' && (
            <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(231,76,60,.08), rgba(231,76,60,.03))', border: '1px solid rgba(231,76,60,.2)', animation: 'fadeInDown .4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(231,76,60,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={16} style={{ color: '#E74C3C' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#C0392B' }}>Access Denied</span>
              </div>
              <p style={{ fontSize: '13px', color: '#922B21', lineHeight: 1.6, margin: 0 }}>{approvalMessage}</p>
            </div>
          )}

          {approvalStatus === 'updated' && (
            <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(39,174,96,.08), rgba(39,174,96,.03))', border: '1px solid rgba(39,174,96,.2)', animation: 'fadeInDown .4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(39,174,96,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} style={{ color: '#27AE60' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E8449' }}>Email Sent</span>
              </div>
              <p style={{ fontSize: '13px', color: '#186A3B', lineHeight: 1.6, margin: 0 }}>{approvalMessage}</p>
            </div>
          )}

          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading} />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" onClick={handleForgotPassword} style={{ fontSize: '12px', color: '#2E86C1', fontWeight: 700, textDecoration: 'none' }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
            Don't have an account? <Link to="/register" style={{ color: '#2E86C1', fontWeight: 700 }}>Register here</Link>
          </p>
        </form>
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
