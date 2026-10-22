# connectly

# Connectly — Real-Time Messaging App

Connectly is a full-stack messaging application built with React and Node.js. It allows users to create accounts, manage their profiles, discover contacts, and exchange messages in real time.

## Live Demo

- **Frontend:** https://connectly-web-lrcw.onrender.com
- **Backend API:** https://connectly-9p3p.onrender.com

## Features

- User registration and login
- Password hashing and JWT-based authentication
- Contact discovery
- Real-time messaging with Socket.IO
- Profile management and avatar uploads
- Message timestamps
- Responsive chat interface
- PostgreSQL database integration
- Deployed frontend and backend

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs
- Multer for file uploads

### Deployment and Tools
- Render
- Neon PostgreSQL
- Git and GitHub

## Architecture

```text
React Frontend
      |
      | REST API
      | Socket.IO
      v
Node.js + Express Backend
      |
      v
PostgreSQL Database
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL, or a configured PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Ranjithaprabu/connectly.git
cd connectly
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Configure your backend environment variables in a `.env` file. Use the variable names expected by your application, such as:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend API base URL in `src/api/client.js` for your local or deployed backend.

## API Health Check

The deployed backend health endpoint is available at:

https://connectly-9p3p.onrender.com/api/health

## Security Notes

- Never commit `.env` files, database credentials, API secrets, or JWT secrets.
- Passwords are hashed before storage.
- Authenticated endpoints use JWT authorization.
- Configure CORS and environment variables appropriately for deployment.

## Future Improvements

- Cloud-based profile image storage
- Google sign-in
- Message read receipts
- Typing indicators
- Online presence
- Group conversations

## Author

**Ranjitha Prabu**

GitHub: https://github.com/Ranjithaprabu

---

Built as a full-stack project to practice authentication, API development, database integration, real-time communication, and deployment.
