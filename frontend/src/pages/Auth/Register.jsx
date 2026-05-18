import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../firebase';

export default function Register() {
  const [form, setForm] = useState({ name: '', hotelName: '', email: '', phone: '', city: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null); // null | 'pending'
  const [approvalMessage, setApprovalMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Toggle this to true when Blaze plan is purchased to enable OTP
  const ENABLE_OTP = false;

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) { }
      }
    };
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    let phoneNumber = form.phone.trim();
    if (!phoneNumber) {
      setOtpError('Phone number is required');
      setOtpLoading(false);
      return;
    }

    phoneNumber = phoneNumber.replace(/[\s-]/g, '');

    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.length === 10) {
        phoneNumber = '+91' + phoneNumber;
      } else {
        setOtpError('Please include country code, e.g. +919876543210');
        setOtpLoading(false);
        return;
      }
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setOtpError('reCAPTCHA expired. Please try again.');
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setError('');
      update('phone', phoneNumber);
    } catch (err) {
      console.error(err);

      // If Firebase throws an auth/too-many-requests or other error, display a clean message
      let msg = err.message || 'Failed to send OTP. Please try again.';
      if (msg.includes('auth/invalid-phone-number')) msg = 'Invalid phone number format.';
      if (msg.includes('auth/too-many-requests')) msg = 'Too many attempts. Try again later.';

      setOtpError(msg);

      // We DO NOT clear the verifier here. Re-creating RecaptchaVerifier on the same DOM 
      // element without proper cleanup causes the "already rendered" error. 
      // Re-using the existing instance is safe.
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter a 6-digit OTP code.');
      setOtpLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otpCode);
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtpCode('');
      setOtpError('');
    } catch (err) {
      console.error(err);
      setOtpError('Invalid OTP code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const isBasicInfoFilled = 
    form.name.trim() !== '' && 
    form.hotelName.trim() !== '' && 
    form.email.trim() !== '' && 
    form.city.trim() !== '';

  const isAllOtherFieldsFilled = 
    isBasicInfoFilled && 
    form.password !== '' && 
    form.confirmPassword !== '' &&
    agreedToTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (ENABLE_OTP && !isPhoneVerified) {
      setError('Please verify your mobile number with OTP first.');
      return;
    }

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
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  // ─── Pending Approval Screen ───
  if (approvalStatus === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <UtensilsCrossed size={32} style={{ color: '#5DADE2' }} />
              <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>Try<span style={{ color: '#5DADE2' }}>Scan</span></span>
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
      <style>{`
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed !important;
        }
        .hover-underline {
          color: #EF4444;
          text-decoration: none;
          transition: all 0.2s;
        }
        .hover-underline:hover {
          color: #DC2626;
          text-decoration: underline;
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <UtensilsCrossed size={32} style={{ color: '#5DADE2' }} />
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>Try<span style={{ color: '#5DADE2' }}>Scan</span></span>
          </Link>
          <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '15px' }}>Register your restaurant and go live today!</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>{error}</div>}
          <div className="grid-2">
            {/* Render Name, Restaurant Name, Email, and City */}
            {fields.filter(f => f.key === 'name' || f.key === 'hotelName' || f.key === 'email' || f.key === 'city').map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} required />
              </div>
            ))}

            {/* Render Phone Field with Verification Flow */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Phone Number</label>
                {ENABLE_OTP && isPhoneVerified && (
                  <span style={{ color: '#2ECC71', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={15} /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={ENABLE_OTP && (isPhoneVerified || otpSent)}
                  style={{ flex: 1, backgroundColor: (ENABLE_OTP && (isPhoneVerified || otpSent)) ? '#F1F5F9' : '#fff' }}
                  required
                />
                {ENABLE_OTP && !isPhoneVerified && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !form.phone || !isBasicInfoFilled}
                    className="btn btn-primary"
                    style={{ padding: '0 16px', fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
                {ENABLE_OTP && otpSent && (
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpError(''); }}
                    className="btn"
                    style={{ padding: '0 16px', fontSize: '13px', whiteSpace: 'nowrap', borderColor: '#CBD5E1', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Change
                  </button>
                )}
              </div>

              {ENABLE_OTP && otpError && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                  {otpError}
                </div>
              )}
              {ENABLE_OTP && otpSent && !otpError && !isPhoneVerified && (
                <div style={{ color: '#10B981', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                  OTP sent successfully!
                </div>
              )}

              {/* Recaptcha Anchor */}
              {ENABLE_OTP && <div id="recaptcha-container" style={{ marginTop: '8px' }}></div>}
            </div>

            {/* OTP Verification Code Input */}
            {ENABLE_OTP && otpSent && !isPhoneVerified && (
              <div className="form-group" style={{ gridColumn: '1 / -1', background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '4px' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>Enter 6-Digit OTP</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{ flex: 1, letterSpacing: '4px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length !== 6}
                    className="btn btn-primary"
                    style={{ padding: '0 20px', background: '#2ECC71', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Render Password and Confirm Password */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {fields.filter(f => f.key === 'password' || f.key === 'confirmPassword').map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} required />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }} disabled={loading || (ENABLE_OTP && !isPhoneVerified) || !isAllOtherFieldsFilled}>
            {loading ? 'Submitting Request...' : <><span>Register & Request Access</span> <ArrowRight size={16} /></>}
          </button>
          {ENABLE_OTP && !isPhoneVerified && (
            <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>
              * Phone verification is required to submit.
            </p>
          )}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748B' }}>
            Already registered? <Link to="/login" style={{ color: '#2E86C1', fontWeight: 600 }}>Log in</Link>
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '16px', fontSize: '12px', color: '#94A3B8', textAlign: 'left' }}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: '2px', marginRight: '8px', cursor: 'pointer' }} 
            />
            <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: '1.4' }}>
              By registering, I agree to the{' '}
              <Link to="/terms-and-conditions" className="hover-underline">Terms & Conditions</Link>,{' '}
              <Link to="/privacy-policy" className="hover-underline">Privacy Policy</Link>, and{' '}
              <Link to="/cookies-policy" className="hover-underline">Cookies Policy</Link>.
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}