To-Do List
This is a simple To-Do List application built with React, JavaScript, and MongoDB. It allows users to manage their tasks efficiently with various features such as adding, editing, deleting, and sorting tasks by priority or completion status.
#LIVE DEMO https://todo-list-yuriev.netlify.app/
Features
Add tasks: Add new tasks with a corresponding due date.
Mark as completed: Mark tasks as completed or not completed.
Sort tasks:
By priority: High, Medium, Low
or Date 
By completion status (Completed/Uncompleted)
Edit tasks: Update task details, including title and date.
Delete tasks: Remove tasks from the list.
Technologies Used
Frontend: React, JavaScript
Backend: MongoDB (for storing tasks)
State Management: React state (or could integrate Redux if needed)
Installation
Clone the repository:

bash

git clone <repository-url>
Navigate to the project directory:

bash

cd todo-list-app
Install the necessary dependencies:

bash

npm install
Run the application:

bash

npm start
Open the application in your browser at http://localhost:3000.

Usage
Adding a task: Click on the "Add Task" button and fill in the task title and due date.
Marking as completed: Check the checkbox next to the task to mark it as completed.
Sorting: Use the sorting options to organize tasks by priority, alphabetically, or by completion status.
Editing a task: Click on a task to edit its title or due date.
Deleting a task: Click on the trash icon next to the task to remove it.
API Endpoints
The application interacts with a MongoDB database for storing tasks. The following endpoints are available:

GET /tasks - Fetch all tasks.
POST /tasks - Create a new task.
PUT /tasks/:id - Update an existing task.
DELETE /tasks/:id - Delete a task.
Future Enhancements
User authentication
Notifications/reminders for due tasks
Task categories and labels
