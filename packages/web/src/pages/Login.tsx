import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg-off-white)',
    }}>
      <div className="sp-card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p className="sp-label" style={{ marginBottom: '8px' }}>
            {isSignup ? 'Create Account' : 'Welcome back'}
          </p>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            fontWeight: 400,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
            {isSignup ? 'Join StagePass' : 'Sign in to'}
            <br />
            <span style={{ fontStyle: 'italic', color: 'var(--text-body)' }}>your account.</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                Full Name
              </label>
              <input
                type="text"
                className="sp-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}>
              Email
            </label>
            <input
              type="email"
              className="sp-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              className="sp-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#ef4444',
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="sp-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: 'var(--text-body)',
        }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--brand-secondary)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Demo credentials */}
        <div style={{
          marginTop: '24px',
          padding: '14px 16px',
          background: 'rgba(74, 222, 128, 0.06)',
          border: '1px solid rgba(74, 222, 128, 0.15)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p className="sp-label" style={{ marginBottom: '6px' }}>Demo credentials</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-body)', margin: 0 }}>
            john@example.com · password123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
