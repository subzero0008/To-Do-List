import React, { useState } from 'react';
import axios from 'axios';

function AuthForm({ onLogin }) {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => { setError(''); };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetForm();

    if (screen === 'register') {
      if (!email || !password || !confirmPassword) { setError('All fields are required.'); return; }
      if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }
    if (screen === 'login') {
      if (!email || !password) { setError('Email and password are required.'); return; }
      if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
    }

    setLoading(true);
    try {
      if (screen === 'login') {
        const res = await axios.post('/.netlify/functions/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.email);
        onLogin(res.data.token, res.data.email);
      } else if (screen === 'register') {
        const res = await axios.post('/.netlify/functions/auth/register', { email, password, confirmPassword });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.email);
        onLogin(res.data.token, res.data.email);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchScreen = (s) => {
    setScreen(s);
    resetForm();
    setEmail(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>My To-Do List</h1>
        <div className="auth-tabs">
          <button className={`auth-tab ${screen === 'login' ? 'active' : ''}`} onClick={() => switchScreen('login')}>Login</button>
          <button className={`auth-tab ${screen === 'register' ? 'active' : ''}`} onClick={() => switchScreen('register')}>Register</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
          />
          {screen === 'register' && (
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
            {loading ? 'Please wait...' : screen === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;