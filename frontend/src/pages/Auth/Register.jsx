import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', hotelName: '', email: '', phone: '', city: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null); // null | 'pending'
  const [approvalMessage, setApprovalMessage] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      if (data.approvalStatus === 'pending') {
        setApprovalStatus('pending');
        setApprovalMessage(data.message || "We received your request, we'll reach you soon.");
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { key: 'hotelName', label: 'Restaurant Name', type: 'text', placeholder: 'Café Royale' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 9876543210' },
    { key: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ];

  // ─── Pending Approval Screen ───
  if (approvalStatus === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <UtensilsCrossed size={32} style={{ color: '#5DADE2' }} />
              <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>Table<span style={{ color: '#5DADE2' }}>Tap</span></span>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '48px 36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'fadeInUp .6s ease',
          }}>
            {/* Animated Status Icon */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(243,156,18,.12), rgba(243,156,18,.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', border: '3px solid rgba(243,156,18,.2)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <Clock size={36} style={{ color: '#F39C12' }} />
            </div>

            <h2 style={{
              fontFamily: "'Outfit',sans-serif", fontSize: '24px', fontWeight: 800,
              color: '#1A202C', marginBottom: '12px',
            }}>
              Request Submitted!
            </h2>

            <p style={{
              fontSize: '16px', color: '#4A5568', lineHeight: 1.7,
              marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px',
            }}>
              {approvalMessage}
            </p>

            {/* Status Tracker */}
            <div style={{
              background: '#F8FAFC', borderRadius: '14px', padding: '24px',
              border: '1px solid #E2E8F0', marginBottom: '28px',
            }}>
              <h4 style={{
                fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 700,
                color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.5px',
                marginBottom: '18px',
              }}>
                Approval Status
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Pending */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(243,156,18,.08)', border: '1px solid rgba(243,156,18,.15)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#F39C12', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Clock size={14} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#B7770D' }}>Pending</span>
                    <span style={{ fontSize: '11px', color: '#D4A017', marginLeft: '8px' }}>— Under review</span>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                    background: 'rgba(243,156,18,.15)', color: '#B7770D',
                  }}>Current</span>
                </div>

                {/* Accepted */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: '#F8FAFC', border: '1px solid #EDF2F7', opacity: 0.5,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle2 size={14} style={{ color: '#A0AEC0' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#A0AEC0' }}>Accepted</span>
                </div>

                {/* Denied */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: '#F8FAFC', border: '1px solid #EDF2F7', opacity: 0.5,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <XCircle size={14} style={{ color: '#A0AEC0' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#A0AEC0' }}>Denied</span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '14px 16px', borderRadius: '10px',
              background: 'rgba(46,134,193,.06)', border: '1px solid rgba(46,134,193,.12)',
              marginBottom: '24px',
            }}>
              <ShieldCheck size={18} style={{ color: '#2E86C1', marginTop: '1px', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                Our team reviews all registration requests to ensure quality service. You'll be notified once your request is processed.
              </p>
            </div>

            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              background: 'linear-gradient(135deg, #1B4F72, #2E86C1)', color: '#fff',
              textDecoration: 'none', transition: 'all .2s',
            }}>
              Go to Login <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(243,156,18,0.3); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(243,156,18,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(243,156,18,0); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Registration Form ───
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <UtensilsCrossed size={32} style={{ color: '#5DADE2' }} />
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>Table<span style={{ color: '#5DADE2' }}>Tap</span></span>
          </Link>
          <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '15px' }}>Register your restaurant and go live today!</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</div>}
          <div className="grid-2">
            {fields.filter(f => f.key !== 'city' && f.key !== 'password').map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} required />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fields.filter(f => f.key === 'city' || f.key === 'password').map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} required />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }} disabled={loading}>
            {loading ? 'Submitting Request...' : <><span>Register & Request Access</span> <ArrowRight size={16} /></>}
          </button>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748B' }}>
            Already registered? <Link to="/login" style={{ color: '#2E86C1', fontWeight: 600 }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}