// netlify/functions/todos.js
const todos = [];

exports.handler = async function(event, context) {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify(todos)
    };
  }
  
  if (event.httpMethod === 'POST') {
    const { text, date, priority } = JSON.parse(event.body);
    todos.push({ text, date, priority });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Todo added' })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
