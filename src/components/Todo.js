import React, { useState } from 'react';

function Todo({ todo, completeTodo, removeTodo, editTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(todo.text);
  const [newDate, setNewDate] = useState(todo.date);
  const [newPriority, setNewPriority] = useState(todo.priority);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!newText || !newDate) {
      setErrorMessage('Both task name and date are required.');
      return;
    }
    if (newText.length < 5 || newText.length > 50) {
      setErrorMessage('Task text must be between 5 and 50 characters.');
      return;
    }
    setErrorMessage('');
    editTodo(todo._id, newText, newDate, newPriority);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewText(todo.text);
    setNewDate(todo.date);
    setNewPriority(todo.priority);
    setErrorMessage('');
    setIsEditing(false);
  };

  return (
    <div
      className="todo"
      style={{ textDecoration: todo.isCompleted ? 'line-through' : '' }}
    >
      <div className="todo-content">
        {isEditing ? (
          <>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <input
              type="text"
              className="edit-input"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <input
              type="date"
              className="edit-input"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <select
              className="edit-input"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <strong>{todo.text}</strong>
            <div className="todo-date">Due: {todo.date}</div>
            <div className={`todo-priority ${todo.priority}`}>
              Priority: {todo.priority}
            </div>
          </>
        )}
      </div>
      <div>
        <button
          className="complete-btn"
          onClick={() => completeTodo(todo._id)}
        >
          {todo.isCompleted ? 'Undo' : 'Complete'}
        </button>
        <button
          className="remove-btn"
          onClick={() => removeTodo(todo._id)}
        >
          Remove
        </button>
        <button
          className="edit-btn"
          onClick={handleEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default Todo;
