const mongoose = require('mongoose');
const Todo = require('./models/todo'); // Adjust path as needed

exports.handler = async function(event, context) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    let response;
    switch (event.httpMethod) {
      case 'GET':
        // Handle GET request
        response = await Todo.find({}).sort({ priorityOrder: 1 }); // Correct sorting field
        return {
          statusCode: 200,
          body: JSON.stringify(response),
        };

      case 'POST':
        // Handle POST request
        const postData = event.body ? JSON.parse(event.body) : null;
        if (!postData || !postData.text || !postData.date) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid data' }),
          };
        }
        const newTodo = new Todo({
          text: postData.text,
          date: postData.date,
          priority: postData.priority,
          priorityOrder: { High: 1, Medium: 2, Low: 3 }[postData.priority],
        });
        await newTodo.save();
        return {
          statusCode: 201,
          body: JSON.stringify(newTodo),
        };

      case 'PUT':
        const updateData = JSON.parse(event.body);
        console.log('Received PUT request with data:', updateData);

        // Проверка на наличието на основни полета
        if (!updateData || !updateData.text || !updateData.date || typeof updateData.priorityOrder !== 'number') {
          console.error('Invalid data received:', updateData);
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid data' }),
          };
        }

        // Извличане на ID от URL
        const id = event.path.split('/').pop();

        // Опит за обновяване на записа
        try {
          const updatedTodo = await Todo.findByIdAndUpdate(
            id, // ID от URL
            { $set: updateData }, // Полета за обновяване
            { new: true, runValidators: true } // Добавяне на валидация
          );

          console.log('Updated Todo:', updatedTodo);

          if (!updatedTodo) {
            console.error('Todo not found:', id);
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Todo not found' }),
            };
          }

          return {
            statusCode: 200,
            body: JSON.stringify(updatedTodo),
          };
        } catch (err) {
          console.error('Error updating Todo:', err);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server Error' }),
          };
        }

      case 'DELETE':
        // Handle DELETE request
        const deleteId = event.path.split('/').pop();
        if (!deleteId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid ID' }),
          };
        }
        await Todo.findByIdAndDelete(deleteId);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Deleted' }),
        };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server Error' }),
    };
  }
};
