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
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sortBy: sortBy || 'priority', filterBy, dateOrder: dateOrder || 'asc' }
      });

      if (Array.isArray(response.data)) {
        let filteredTodos = response.data.filter(todo => todo);
        if (filterBy === 'completed') filteredTodos = filteredTodos.filter(t => t.isCompleted);
        else if (filterBy === 'incomplete') filteredTodos = filteredTodos.filter(t => !t.isCompleted);

        const sortedTodos = filteredTodos.sort((a, b) => {
          if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
          if (sortBy === 'date') return dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
          return 0;
        });
        setTodos(sortedTodos);
      }
    } catch (error) {
      if (error.response?.status === 401) handleLogout();
      console.error('Error fetching todos:', error);
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
      const response = await axios.post(apiUrl, { text, date, priority }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newTodos = [...todos, response.data].filter(t => t).sort((a, b) => {
        if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
        if (sortBy === 'date') return dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        return 0;
      });
      setTodos(newTodos);
    } catch (error) {
      console.error('Error adding todo:', error);
      setErrorMessage('Failed to add todo.');
    }
  };

  const completeTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      const updated = await axios.put(`${apiUrl}/${id}`, { isCompleted: !todo.isCompleted }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todos.map(t => t._id === id ? updated.data : t));
    } catch (error) {
      console.error('Error completing todo:', error);
      setErrorMessage('Failed to complete the todo');
    }
  };

  const removeTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      await axios.delete(`${apiUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error removing todo:', error);
      setErrorMessage('Failed to remove the todo');
    }
  };

  const editTodo = async (id, newText, newDate, newPriority) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      const updated = await axios.put(`${apiUrl}/${id}`, {
        text: newText,
        date: newDate,
        priority: newPriority,
        priorityOrder: { High: 1, Medium: 2, Low: 3 }[newPriority],
        isCompleted: todo.isCompleted
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedTodos = todos.map(t => t._id === id ? updated.data : t).filter(t => t).sort((a, b) => {
        if (sortBy === 'priority') return a.priorityOrder - b.priorityOrder;
        if (sortBy === 'date') return dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        return 0;
      });
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error editing todo:', error);
      setErrorMessage('Failed to edit the todo');
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