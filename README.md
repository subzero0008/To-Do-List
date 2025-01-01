# LMS Learn

LMS Learn is a robust and scalable Learning Management System (LMS) developed as part of the E-learning course project at my university. The platform is designed using the MERN stack (MongoDB, Express.js, React.js, Node.js) to deliver a seamless experience for students and instructors.

## Features

### Instructor Features
- Create, update, and delete courses.
- Upload videos, PDFs, and other course materials.
- View enrolled students.
- Publish and unpublish courses.

### Student Features
- Browse and preview courses.
- Purchase courses securely using PayPal.
- Access lectures and course materials upon purchase.
- Track progress through enrolled courses.

### Core Functionalities
- **Payment Integration**: Secure PayPal sandbox integration for testing payments.
- **Course Management**: Full CRUD functionality for courses.
- **Role-based Access**: Separate access and dashboards for students and instructors.
- **Media Uploads**: Cloudinary integration for hosting videos and images.

## Technology Stack

### Frontend
- **React.js**: Component-based architecture for dynamic UI.
- **TailwindCSS**: Utility-first CSS framework for fast and responsive styling.
- **Axios**: Used for making API requests between the frontend and backend.

### Backend
- **Node.js**: Handles server-side logic and API development.
- **Express.js**: Lightweight framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user data, courses, and payment details.
- **Mongoose**: ODM library for seamless interaction with MongoDB.

### Additional Tools and Libraries
- **Cloudinary**: For storing and streaming media files.
- **PayPal REST SDK**: For secure payment processing in sandbox mode.
- **Nodemon**: For hot-reloading during development.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lms-learn.git
   Navigate to the project directory:

cd lms-learn
Install dependencies: npm install
Create a .env file in the root directory and add the following:
plaintext
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your-mongodb-uri
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET_ID=your-paypal-secret-id
Start the backend server:
cd/server
npm start
Navigate to the client directory and install dependencies
cd client
Start the frontend development server:
npm start
How It Works
Instructor Workflow: Instructors can log in, manage their courses, upload content, and track their students.
Student Workflow: Students can browse available courses, purchase them, and access the content.
Payments: Payments are processed using the PayPal sandbox for testing.



