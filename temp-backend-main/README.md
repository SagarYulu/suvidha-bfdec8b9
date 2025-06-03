
# Yulu Grievance Portal - Backend API

## Overview
This is the backend API for the Yulu Grievance Portal, built with Express.js and MySQL.

## Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup
1. Install MySQL and start the service
2. Create a new database named `grievance_portal`
3. Import the provided SQL schema file to create all tables
4. Update the database credentials in `.env`

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env` file and update the database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=grievance_portal
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/verify` - Verify token

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/employee/my-issues` - Get employee issues

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/employees` - Get all employees

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/analytics` - Get feedback analytics

## Security Features
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Health Check
Visit `http://localhost:5000/health` to check if the API is running.
