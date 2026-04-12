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

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    await connectDB();

    const path = event.path.replace(/\/+$/, '');
    const action = path.split('/').pop(); // 'register' or 'login'
    const data = event.body ? JSON.parse(event.body) : null;

    if (!data?.username || !data?.password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    if (action === 'register') {
      const exists = await User.findOne({ username: data.username });
      if (exists) {
        return {
          statusCode: 409,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Username already taken' }),
        };
      }
      const hashed = await bcrypt.hash(data.password, 10);
      const user = await User.create({ username: data.username, password: hashed });
      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ token, username: user.username }),
      };
    }

    if (action === 'login') {
      const user = await User.findOne({ username: data.username });
      if (!user) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid username or password' }),
        };
      }
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid username or password' }),
        };
      }
      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ token, username: user.username }),
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (err) {
    console.error('Auth error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server error', details: err.message }),
    };
  }
};