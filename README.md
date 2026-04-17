# My To-Do List App

A full-stack todo application built with React, Netlify Functions, and MongoDB Atlas.

## Live Demo

[https://todo-list-yuriev.netlify.app/)

## Features

- User registration and login with JWT authentication
- Each user sees only their own todos
- Email validation on registration
- Confirm password field with real-time match indicator
- Add, edit, complete and delete todos
- Sort by priority or date
- Filter by completed / incomplete
- Date picker with minimum date validation
- Modern glass UI design with animations
- Fully responsive

## Tech Stack

**Frontend**
- React 18
- Axios
- CSS3 (glassmorphism, animations)

**Backend**
- Netlify Functions (serverless)
- Node.js
- MongoDB Atlas
- Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)

## Project Structure
To-Do-List/
├── netlify/
│   └── functions/
│       ├── models/
│       │   ├── Todo.js
│       │   └── User.js
│       ├── auth.js
│       ├── todos.js
│       └── package.json
├── public/
├── src/
│   ├── components/
│   │   ├── AuthForm.js
│   │   ├── Todo.js
│   │   └── TodoForm.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── netlify.toml
└── package.json
## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Netlify account

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/subzero0008/To-Do-List.git
cd To-Do-List
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install function dependencies:
```bash
cd netlify/functions && npm install && cd ../..
```

4. Create a `.env` file in the root:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app
JWT_SECRET=your-secret-key
5. Install Netlify CLI and run locally:
```bash
npm install -g netlify-cli
netlify dev
```

App will be available at `http://localhost:8888`

## Deployment

This app is deployed on Netlify with automatic deploys from the `main` branch.

### Environment Variables (Netlify)

| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |

### netlify.toml

```toml
[build]
  base = "."
  command = "npm run build"
  publish = "build"
  functions = "netlify/functions"

[build.environment]
  CI = "false"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## API Endpoints

### Auth — `/.netlify/functions/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and receive JWT |

### Todos — `/.netlify/functions/todos`

All endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Get all todos for current user |
| POST | `/todos` | Create new todo |
| PUT | `/todos/:id` | Update todo |
| DELETE | `/todos/:id` | Delete todo |

## Security

- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire after 7 days
- Each user can only access their own todos
- Email format validated on both frontend and backend
- CORS headers configured on all endpoints

## Author

Yulian Yuriev © 2024
EOF