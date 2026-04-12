import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuthForm({ onLogin }) {
  const [screen, setScreen] = useState('login'); // login | register | forgot | reset | verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setScreen('reset');
    }
  }, []);

  const reset = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();

    if (screen === 'register') {
      if (!email || !password || !confirmPassword) { setError('All fields are required.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    if (screen === 'login') {
      if (!email || !password) { setError('Email and password are required.'); return; }
    }

    if (screen === 'forgot') {
      if (!email) { setError('Please enter your email.'); return; }
    }

    if (screen === 'reset') {
      if (!password || !confirmPassword) { setError('All fields are required.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (screen === 'login') {
        const res = await axios.post('/.netlify/functions/auth/login', { email, password });
        const { token, email: loggedEmail } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', loggedEmail);
        onLogin(token, loggedEmail);

      } else if (screen === 'register') {
        await axios.post('/.netlify/functions/auth/register', { email, password, confirmPassword });
        setSuccess('Registration successful! Please check your email to verify your account.');
        setEmail(''); setPassword(''); setConfirmPassword('');

      } else if (screen === 'forgot') {
        await axios.post('/.netlify/functions/auth/forgot-password', { email });
        setSuccess('If this email exists, a reset link has been sent.');

      } else if (screen === 'reset') {
        await axios.post('/.netlify/functions/auth/reset-password', { token: resetToken, password, confirmPassword });
        setSuccess('Password reset successful!');
        setTimeout(() => {
          window.history.replaceState({}, '', '/');
          setScreen('login');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchScreen = (s) => { setScreen(s); reset(); setEmail(''); setPassword(''); setConfirmPassword(''); };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>My To-Do List</h1>

        {screen !== 'forgot' && screen !== 'reset' && (
          <div className="auth-tabs">
            <button className={`auth-tab ${screen === 'login' ? 'active' : ''}`} onClick={() => switchScreen('login')}>Login</button>
            <button className={`auth-tab ${screen === 'register' ? 'active' : ''}`} onClick={() => switchScreen('register')}>Register</button>
          </div>
        )}

        {screen === 'forgot' && (
          <div className="auth-back" onClick={() => switchScreen('login')}>← Back to login</div>
        )}
        {screen === 'reset' && (
          <p className="auth-subtitle">Enter your new password below.</p>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            {(screen === 'login' || screen === 'register' || screen === 'forgot') && (
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            )}
            {(screen === 'login' || screen === 'register' || screen === 'reset') && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
              />
            )}
            {(screen === 'register' || screen === 'reset') && (
              <div className="password-match-wrap">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={confirmPassword ? (password === confirmPassword ? 'input-valid' : 'input-invalid') : ''}
                />
                {confirmPassword && (
                  <span className={`match-indicator ${password === confirmPassword ? 'match' : 'no-match'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
            )}

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Please wait...' : screen === 'login' ? 'Login' : screen === 'register' ? 'Create account' : screen === 'forgot' ? 'Send reset link' : 'Reset password'}
            </button>
          </form>
        )}

        {screen === 'login' && !success && (
          <div className="auth-forgot" onClick={() => switchScreen('forgot')}>Forgot password?</div>
        )}
      </div>
    </div>
  );
}

export default AuthForm;