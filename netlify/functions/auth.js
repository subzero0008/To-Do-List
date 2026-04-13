const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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
      const user = await User.create({
        email: data.email,
        password: hashed,
        isVerified: true,
      });

      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ token, email: user.email }),
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

    return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Not found' }) };

  } catch (err) {
    console.error('Auth error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
};