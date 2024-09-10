// src/components/TodoForm.js
import React, { useState } from 'react';

function TodoForm({ addTodo }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text && date) {
      addTodo(text, date, priority);
      setText('');
      setDate('');
      setPriority('Medium');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter task"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TodoForm;
