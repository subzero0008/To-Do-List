import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Todo from './components/Todo';
import TodoForm from './components/TodoForm';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('priority');
  const [dateOrder, setDateOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Wrap fetchTodos with useCallback to memoize the function
  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get('/todos', {
        params: {
          sortBy,
          filterBy,
          dateOrder,
        },
      });

      const sortedTodos = response.data.sort((a, b) => {
        if (sortBy === 'priority') {
          return a.priorityOrder - b.priorityOrder;
        } else if (sortBy === 'date') {
          return dateOrder === 'asc'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return 0;
      });

      setTodos(sortedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }, [sortBy, filterBy, dateOrder]); // Add sortBy, filterBy, and dateOrder as dependencies

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // Now fetchTodos is added as a dependency

  // Rest of your code remains the same
  const addTodo = async (text, date, priority) => {
    if (!text || !date) {
      setErrorMessage('Both task name and date are required.');
      return;
    }
    if (text.length < 5 || text.length > 50) {
      setErrorMessage('Task text must be between 5 and 50 characters.');
      return;
    }
    setErrorMessage('');

    try {
      const response = await axios.post('/todos', { text, date, priority });
      const newTodos = [...todos, response.data];

      const sortedTodos = newTodos.sort((a, b) => {
        if (sortBy === 'priority') {
          return a.priorityOrder - b.priorityOrder;
        } else if (sortBy === 'date') {
          return dateOrder === 'asc'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return 0;
      });

      setTodos(sortedTodos);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Remaining CRUD functions...

  return (
    <div className="app">
      <h1>My To-Do List</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="filters">
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="date">Date</option>
          </select>
        </label>
        {sortBy === 'date' && (
          <label>
            Date order:
            <select
              value={dateOrder}
              onChange={(e) => setDateOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        )}
        <label>
          Filter by:
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </label>
      </div>
      <div className="todo-list">
        {todos.map((todo) => (
          <Todo
            key={todo._id}
            todo={todo}
            completeTodo={() => completeTodo(todo._id)}
            removeTodo={() => removeTodo(todo._id)}
            editTodo={(newText, newDate, newPriority) =>
              editTodo(todo._id, newText, newDate, newPriority)
            }
          />
        ))}
        <TodoForm addTodo={addTodo} />
      </div>
      <div className="footer">
        <p>&copy; 2024 Yulian Yuriev. All rights are reserved.</p>
      </div>
    </div>
  );
}

export default App;
