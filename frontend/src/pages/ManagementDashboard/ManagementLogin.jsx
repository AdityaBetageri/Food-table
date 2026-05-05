import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Eye, EyeOff, AlertCircle, Loader2, KeyRound, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import './ManagementLogin.css';

export default function ManagementLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if already authenticated as admin
  useEffect(() => {
    const token = localStorage.getItem('mgmt_token');
    if (token) {
      api.managementAuth.getMe()
        .then(() => navigate('/management'))
        .catch(() => {
          localStorage.removeItem('mgmt_token');
          localStorage.removeItem('mgmt_admin');
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await api.managementAuth.login({ email, password });
        localStorage.setItem('mgmt_token', data.token);
        localStorage.setItem('mgmt_admin', JSON.stringify(data.admin));
        navigate('/management');
      } else {
        // Register
        const data = await api.managementAuth.register({ name, email, password, setupKey });
        // Auto-login after registration
        localStorage.setItem('mgmt_token', data.token);
        localStorage.setItem('mgmt_admin', JSON.stringify(data.admin));
        navigate('/management');
      }
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Login failed.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="mgmt-login-page">
        <div className="mgmt-login-loading">
          <Loader2 size={32} className="mgmt-login-spinner" />
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mgmt-login-page">
      {/* Background decoration */}
      <div className="mgmt-login-bg-orb mgmt-login-bg-orb-1" />
      <div className="mgmt-login-bg-orb mgmt-login-bg-orb-2" />
      <div className="mgmt-login-bg-orb mgmt-login-bg-orb-3" />

      <div className="mgmt-login-container">
        {/* Left panel — branding */}
        <div className="mgmt-login-brand">
          <div className="mgmt-login-brand-content">
            <div className="mgmt-login-shield-wrap">
              <ShieldCheck size={48} />
            </div>
            <h1>Management<br />Console</h1>
            <p>Restricted access for authorized platform administrators only. This portal is completely separate from the hotel owner system.</p>
            <div className="mgmt-login-features">
              <div className="mgmt-login-feature">
                <Lock size={16} />
                <span>Isolated Authentication</span>
              </div>
              <div className="mgmt-login-feature">
                <KeyRound size={16} />
                <span>Separate Admin Database</span>
              </div>
              <div className="mgmt-login-feature">
                <ShieldCheck size={16} />
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>
          <div className="mgmt-login-brand-footer">
            <span>TableTap Platform v2.0</span>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="mgmt-login-form-panel">
          <div className="mgmt-login-form-wrap">
            {/* Mode Toggle Tabs */}
            <div className="mgmt-login-mode-tabs">
              <button
                type="button"
                className={`mgmt-login-mode-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
                id="mgmt-tab-login"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`mgmt-login-mode-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
                id="mgmt-tab-register"
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>

            <div className="mgmt-login-form-header">
              <div className="mgmt-login-admin-badge">
                <ShieldCheck size={14} />
                <span>{mode === 'login' ? 'ADMIN ACCESS' : 'NEW ADMIN'}</span>
              </div>
              <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Enter your management credentials to continue' : 'Register a new admin with your team setup key'}</p>
            </div>

            {error && (
              <div className="mgmt-login-error" style={{ animation: 'mgmtShake .4s ease' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mgmt-login-success">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mgmt-login-form">
              {/* Name — register only */}
              {mode === 'register' && (
                <div className="mgmt-login-field" style={{ animation: 'mgmtSlideIn .3s ease' }}>
                  <label htmlFor="mgmt-name">Full Name</label>
                  <input
                    id="mgmt-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="mgmt-login-field">
                <label htmlFor="mgmt-email">Email Address</label>
                <input
                  id="mgmt-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourteam.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mgmt-login-field">
                <label htmlFor="mgmt-password">Password</label>
                <div className="mgmt-login-password-wrap">
                  <input
                    id="mgmt-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="mgmt-login-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Setup Key — register only */}
              {mode === 'register' && (
                <div className="mgmt-login-field" style={{ animation: 'mgmtSlideIn .3s ease .1s both' }}>
                  <label htmlFor="mgmt-setup-key">
                    <KeyRound size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Team Setup Key
                  </label>
                  <input
                    id="mgmt-setup-key"
                    type="password"
                    value={setupKey}
                    onChange={e => setSetupKey(e.target.value)}
                    placeholder="Enter your team's setup key"
                    required
                    autoComplete="off"
                  />
                  <span className="mgmt-login-hint">Ask your team lead for this key</span>
                </div>
              )}

              <button type="submit" className="mgmt-login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="mgmt-login-spinner" />
                    <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Access Management Console' : 'Create Admin Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mgmt-login-footer">
              <Lock size={12} />
              <span>This is a restricted area. Unauthorized access attempts are logged.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
