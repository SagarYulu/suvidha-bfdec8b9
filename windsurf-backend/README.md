
# Grievance Portal Backend

Node.js/Express.js backend API for the Grievance Portal application.

## Features

- RESTful API endpoints
- MySQL database integration
- JWT authentication
- Role-based access control
- File upload support
- Rate limiting
- Security middleware
- Error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up MySQL database and run migrations:
```bash
# See ../windsurf-database/README.md for database setup
npm run migrate
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/employee/login` - Employee login
- GET `/api/auth/verify` - Verify token

### Issues
- GET `/api/issues` - Get all issues (with filters)
- GET `/api/issues/:id` - Get single issue
- POST `/api/issues` - Create new issue
- PATCH `/api/issues/:id/status` - Update issue status
- PATCH `/api/issues/:id/assign` - Assign issue
- POST `/api/issues/:id/comments` - Add comment

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get single user
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Analytics
- GET `/api/analytics/dashboard` - Get dashboard analytics
- GET `/api/analytics/user/:id` - Get user analytics

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

Build and run with Docker:
```bash
docker build -t grievance-portal-backend .
docker run -p 5000:5000 grievance-portal-backend
```
