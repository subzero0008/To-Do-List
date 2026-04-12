import React, { useState } from 'react';

function TodoForm({ addTodo }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !date) { setErrorMessage('Both task name and date are required.'); return; }
    if (text.length < 5 || text.length > 50) { setErrorMessage('Task text must be between 5 and 50 characters.'); return; }
    setErrorMessage('');
    addTodo(text, date, priority);
    setText('');
    setDate('');
    setPriority('Medium');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <input
        type="text"
        placeholder="Enter task name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="date-picker-wrap">
        <label className="date-label">Due date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
      </div>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="High">🔴 High priority</option>
        <option value="Medium">🟡 Medium priority</option>
        <option value="Low">🔵 Low priority</option>
      </select>
      <button type="submit">+ Add Task</button>
    </form>
  );
}

export default TodoForm;