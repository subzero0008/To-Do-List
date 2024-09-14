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

  const apiUrl = '/.netlify/functions/todos';

  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl, {
        params: {
          sortBy: sortBy || 'priority',
          filterBy,
          dateOrder: dateOrder || 'asc'
        }
      });
  
      console.log('Fetched todos:', response.data);
  
      if (Array.isArray(response.data)) {
        let filteredTodos = response.data.filter(todo => todo);
  
        // Прилагаме филтъра според състоянието на задачите
        if (filterBy === 'completed') {
          filteredTodos = filteredTodos.filter(todo => todo.isCompleted);
        } else if (filterBy === 'incomplete') {
          filteredTodos = filteredTodos.filter(todo => !todo.isCompleted);
        }
  
        const sortedTodos = filteredTodos.sort((a, b) => {
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
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }, [sortBy, dateOrder, filterBy, apiUrl]);
  
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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
      const response = await axios.post(apiUrl, { text, date, priority });
      const newTodos = [...todos, response.data];

      const sortedTodos = newTodos.filter(todo => todo).sort((a, b) => {
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

  const completeTodo = async (id) => {
    const todo = todos.find(t => t._id === id);

    if (!todo || !todo._id) {
      console.error('Todo not found or invalid:', id);
      setErrorMessage('Todo not found or invalid');
      return;
    }

    try {
      const updatedTodo = await axios.put(`${apiUrl}/${id}`, {
        ...todo,
        isCompleted: !todo.isCompleted,
      });
      setTodos(todos.map(t => t._id === id ? updatedTodo.data : t));
    } catch (error) {
      console.error('Error completing todo:', error);
      setErrorMessage('Failed to complete the todo');
    }
  };

  const removeTodo = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        setTodos(todos.filter(t => t._id !== id));
      } catch (error) {
        console.error('Error removing todo:', error);
        setErrorMessage('Failed to remove the todo');
      }
    }
  };

  const editTodo = async (id, newText, newDate, newPriority) => {
    const todo = todos.find(t => t._id === id);
  
    if (!todo || !todo._id) {
      console.error('Todo not found or invalid:', id);
      setErrorMessage('Todo not found or invalid');
      return;
    }
  
    try {
      const updatedTodo = await axios.put(`${apiUrl}/${id}`, {
        text: newText,
        date: newDate,
        priority: newPriority,
        priorityOrder: { High: 1, Medium: 2, Low: 3 }[newPriority],
        isCompleted: todo.isCompleted
      });
  
      const updatedTodos = todos.map(t => t._id === id ? updatedTodo.data : t);
  
      const sortedTodos = updatedTodos.filter(todo => todo).sort((a, b) => {
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
      console.error('Error editing todo:', error);
      setErrorMessage('Failed to edit the todo');
    }
  };

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
            <select value={dateOrder} onChange={(e) => setDateOrder(e.target.value)}>
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
        {todos.map(todo => (
          todo ? (
            <Todo
              key={todo._id}
              todo={todo}
              completeTodo={completeTodo}
              removeTodo={removeTodo}
              editTodo={editTodo}
            />
          ) : null
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
