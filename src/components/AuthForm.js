import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const action = isLogin ? 'login' : 'register';
      const response = await axios.post(`/.netlify/functions/auth/${action}`, {
        username,
        password,
      });
      const { token, username: loggedInUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', loggedInUser);
      onLogin(token, loggedInUser);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;
