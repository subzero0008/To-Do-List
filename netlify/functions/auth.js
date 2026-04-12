const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('./models/User');

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.URL || 'http://localhost:8888';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    await connectDB();

    const path = event.path.replace(/\/+$/, '');
    const action = path.split('/').pop();
    const data = event.body ? JSON.parse(event.body) : null;

    // ── REGISTER ──
    if (action === 'register') {
      if (!data?.email || !data?.password || !data?.confirmPassword) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'All fields are required' }) };
      }
      if (!isValidEmail(data.email)) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email address' }) };
      }
      if (data.password.length < 6) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) };
      }
      if (data.password !== data.confirmPassword) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Passwords do not match' }) };
      }

      const exists = await User.findOne({ email: data.email });
      if (exists) {
        return { statusCode: 409, headers: corsHeaders, body: JSON.stringify({ error: 'Email already registered' }) };
      }

      const hashed = await bcrypt.hash(data.password, 10);
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await User.create({
        email: data.email,
        password: hashed,
        verifyToken,
        verifyTokenExpiry,
      });

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: data.email,
        subject: 'Verify your email — My To-Do List',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0c29; border-radius: 16px; color: #f0f0f5;">
            <h2 style="background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Verify your email</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">Click the button below to verify your email and activate your account.</p>
            <a href="${BASE_URL}/.netlify/functions/auth/verify?token=${verifyToken}" 
               style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 12px 28px; border-radius: 28px; text-decoration: none; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 24px;">This link expires in 24 hours.</p>
          </div>
        `,
      });

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Registration successful! Please check your email to verify your account.' }),
      };
    }

    // ── VERIFY EMAIL ──
    if (action === 'verify') {
      const token = event.queryStringParameters?.token;
      if (!token) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid token' }) };
      }

      const user = await User.findOne({
        verifyToken: token,
        verifyTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          body: `<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f0c29;color:#f0f0f5"><h2>Link expired or invalid</h2><p><a href="${BASE_URL}" style="color:#a78bfa">Go back to app</a></p></body></html>`,
        };
      }

      user.isVerified = true;
      user.verifyToken = undefined;
      user.verifyTokenExpiry = undefined;
      await user.save();

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        body: `<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f0c29;color:#f0f0f5"><h2 style="color:#a78bfa">Email verified!</h2><p>Your account is now active.</p><a href="${BASE_URL}" style="display:inline-block;margin-top:16px;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:white;padding:10px 24px;border-radius:28px;text-decoration:none;font-weight:600">Go to app</a></body></html>`,
      };
    }

    // ── LOGIN ──
    if (action === 'login') {
      if (!data?.email || !data?.password) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Email and password are required' }) };
      }

      const user = await User.findOne({ email: data.email });
      if (!user) {
        return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email or password' }) };
      }

      if (!user.isVerified) {
        return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: 'Please verify your email before logging in' }) };
      }

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email or password' }) };
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ token, email: user.email }),
      };
    }

    // ── FORGOT PASSWORD ──
    if (action === 'forgot-password') {
      if (!data?.email) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Email is required' }) };
      }

      const user = await User.findOne({ email: data.email });
      // Винаги връщаме success за да не разкриваме дали имейлът съществува
      if (!user || !user.isVerified) {
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'If this email exists, a reset link has been sent.' }) };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: data.email,
        subject: 'Reset your password — My To-Do List',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0c29; border-radius: 16px; color: #f0f0f5;">
            <h2 style="background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Reset your password</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">Click below to set a new password. This link expires in 1 hour.</p>
            <a href="${BASE_URL}?reset=${resetToken}"
               style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 12px 28px; border-radius: 28px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });

      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'If this email exists, a reset link has been sent.' }) };
    }

    // ── RESET PASSWORD ──
    if (action === 'reset-password') {
      if (!data?.token || !data?.password || !data?.confirmPassword) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'All fields are required' }) };
      }
      if (data.password !== data.confirmPassword) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Passwords do not match' }) };
      }
      if (data.password.length < 6) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) };
      }

      const user = await User.findOne({
        resetToken: data.token,
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Reset link is invalid or expired' }) };
      }

      user.password = await bcrypt.hash(data.password, 10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Password reset successful! You can now log in.' }) };
    }

    return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Not found' }) };

  } catch (err) {
    console.error('Auth error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
};