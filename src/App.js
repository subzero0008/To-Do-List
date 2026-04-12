import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Todo from './components/Todo';
import TodoForm from './components/TodoForm';
import AuthForm from './components/AuthForm';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('priority');
  const [dateOrder, setDateOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const apiUrl = '/.netlify/functions/todos';

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setTodos([]);
  };

  const fetchTodos = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(apiUrl, authHeaders());
      if (Array.isArray(response.data)) {
        let filtered = response.data;
        if (filterBy === 'completed') filtered = filtered.filter(t => t.isCompleted);
        if (filterBy === 'incomplete') filtered = filtered.filter(t => !t.isCompleted);
        const sorted = filtered.sort((a, b) => {
          if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
          if (sortBy === 'date') {
            return dateOrder === 'asc'
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date);
          }
          return 0;
        });
        setTodos(sorted);
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error('Error fetching todos:', err);
    }
  }, [token, sortBy, dateOrder, filterBy]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (text, date, priority) => {
    if (!text || !date) { setErrorMessage('Both task name and date are required.'); return; }
    if (text.length < 5 || text.length > 50) { setErrorMessage('Task text must be between 5 and 50 characters.'); return; }
    setErrorMessage('');
    try {
      const response = await axios.post(apiUrl, { text, date, priority }, authHeaders());
      const newTodos = [...todos, response.data].sort((a, b) => {
        if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
        if (sortBy === 'date') return dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        return 0;
      });
      setTodos(newTodos);
    } catch (err) {
      console.error('Error adding todo:', err);
      setErrorMessage('Failed to add todo.');
    }
  };

  const completeTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      const updated = await axios.put(`${apiUrl}/${id}`, { isCompleted: !todo.isCompleted }, authHeaders());
      setTodos(todos.map(t => t._id === id ? updated.data : t));
    } catch (err) {
      console.error('Error completing todo:', err);
    }
  };

  const removeTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      await axios.delete(`${apiUrl}/${id}`, authHeaders());
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error removing todo:', err);
    }
  };

  const editTodo = async (id, newText, newDate, newPriority) => {
    try {
      const updated = await axios.put(`${apiUrl}/${id}`, {
        text: newText,
        date: newDate,
        priority: newPriority,
        priorityOrder: { High: 1, Medium: 2, Low: 3 }[newPriority],
      }, authHeaders());
      const updatedTodos = todos.map(t => t._id === id ? updated.data : t).sort((a, b) => {
        if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
        if (sortBy === 'date') return dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        return 0;
      });
      setTodos(updatedTodos);
    } catch (err) {
      console.error('Error editing todo:', err);
    }
  };

  if (!token) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>My To-Do List</h1>
        <div className="user-info">
          <span className="username">👤 {username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="filters">
        <label>Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="date">Date</option>
          </select>
        </label>
        {sortBy === 'date' && (
          <label>Date order:
            <select value={dateOrder} onChange={(e) => setDateOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        )}
        <label>Filter by:
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </label>
      </div>
      <div className="todo-list">
        {todos.map(todo => todo ? (
          <Todo key={todo._id} todo={todo} completeTodo={completeTodo} removeTodo={removeTodo} editTodo={editTodo} />
        ) : null)}
        <TodoForm addTodo={addTodo} />
      </div>
      <div className="footer">
        <p>&copy; 2024 Yulian Yuriev. All rights reserved.</p>
      </div>
    </div>
  );
}

export default App;