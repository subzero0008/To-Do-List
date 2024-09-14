const mongoose = require('mongoose');

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

module.exports = Todo;
