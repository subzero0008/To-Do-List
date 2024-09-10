const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/todolist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Todo schema with priority and priorityOrder
const todoSchema = new mongoose.Schema({
  text: String,
  date: String,
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  priorityOrder: {
    type: Number,
    enum: [1, 2, 3], // High: 1, Medium: 2, Low: 3
    default: 2
  },
  isCompleted: Boolean,
});

const Todo = mongoose.model('Todo', todoSchema);

// API Routes
app.get('/todos', async (req, res) => {
  const { sortBy, filterBy, dateOrder } = req.query;
  let sortOptions = {};
  let filterOptions = {};

  // Sorting
  if (sortBy === 'priority') {
    sortOptions = { priorityOrder: 1 };
  } else if (sortBy === 'date') {
    sortOptions.date = dateOrder === 'desc' ? -1 : 1; // Date sorting order
  }

  // Filtering
  if (filterBy) {
    filterOptions.isCompleted = filterBy === 'completed' ? true : filterBy === 'incomplete' ? false : null;
  }

  try {
    const todos = await Todo.find(filterOptions).sort(sortOptions);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error });
  }
});

app.post('/todos', async (req, res) => {
  const { text, date, priority } = req.body;
  const priorityOrder = { High: 1, Medium: 2, Low: 3 }[priority];
  const newTodo = new Todo({
    text,
    date,
    priority,
    priorityOrder,
    isCompleted: false,
  });

  try {
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error adding todo', error });
  }
});

app.put('/todos/:id', async (req, res) => {
  const { text, date, priority, isCompleted } = req.body;
  const priorityOrder = { High: 1, Medium: 2, Low: 3 }[priority];
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, {
      text,
      date,
      priority,
      priorityOrder,
      isCompleted
    }, { new: true });
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
