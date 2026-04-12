const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Todo = require('./models/Todo');

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

const verifyToken = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const user = verifyToken(event);
  if (!user) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    await connectDB();
    const id = event.path.split('/').pop();

    switch (event.httpMethod) {
      case 'GET': {
        const todos = await Todo.find({ userId: user.userId }).sort({ priorityOrder: 1 });
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(todos) };
      }

      case 'POST': {
        const data = event.body ? JSON.parse(event.body) : null;
        if (!data?.text || !data?.date) {
          return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Text and date are required' }) };
        }
        const todo = await Todo.create({
          userId: user.userId,
          text: data.text,
          date: data.date,
          priority: data.priority || 'Medium',
          priorityOrder: { High: 1, Medium: 2, Low: 3 }[data.priority] ?? 2,
          isCompleted: false,
        });
        return { statusCode: 201, headers: corsHeaders, body: JSON.stringify(todo) };
      }

      case 'PUT': {
        if (!id || id === 'todos') {
          return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing ID' }) };
        }
        const data = event.body ? JSON.parse(event.body) : null;
        const updateFields = {};
        if (data.text !== undefined) updateFields.text = data.text;
        if (data.date !== undefined) updateFields.date = data.date;
        if (data.priority !== undefined) {
          updateFields.priority = data.priority;
          updateFields.priorityOrder = { High: 1, Medium: 2, Low: 3 }[data.priority] ?? 2;
        }
        if (data.isCompleted !== undefined) updateFields.isCompleted = data.isCompleted;

        const updated = await Todo.findOneAndUpdate(
          { _id: id, userId: user.userId },
          { $set: updateFields },
          { new: true }
        );
        if (!updated) {
          return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Todo not found' }) };
        }
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(updated) };
      }

      case 'DELETE': {
        if (!id || id === 'todos') {
          return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing ID' }) };
        }
        await Todo.findOneAndDelete({ _id: id, userId: user.userId });
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Deleted' }) };
      }

      default:
        return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
  } catch (err) {
    console.error('Todos error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
};