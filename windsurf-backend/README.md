
# Windsurf Backend - Grievance Portal API

A robust Node.js/Express.js backend API for the Grievance Portal system with proper MVC architecture and MySQL integration.

## Features

- **Clean Architecture**: Proper separation of concerns with Models, Views, Controllers, and Services
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Database Integration**: Robust MySQL integration with connection pooling
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Global error handling with detailed logging
- **Security**: Helmet, CORS, rate limiting, and other security measures
- **Zero Supabase Dependencies**: Completely independent of Supabase

## Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration and connection management
├── controllers/             # Request handlers and response logic
│   ├── AuthController.js
│   ├── UserController.js
│   └── IssueController.js
├── middleware/              # Express middleware
│   ├── auth.js             # Authentication and authorization
│   └── validation.js       # Request validation
├── models/                  # Data models
│   ├── User.js
│   └── Issue.js
├── routes/                  # Route definitions
│   ├── auth.js
│   ├── users.js
│   ├── issues.js
│   └── analytics.js
├── services/               # Business logic layer
│   ├── AuthService.js
│   ├── UserService.js
│   └── IssueService.js
└── server.js              # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Issues
- `GET /api/issues` - Get issues (filtered by user role)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue (Admin/Support only)
- `GET /api/issues/:id/comments` - Get issue comments
- `POST /api/issues/:id/comments` - Add comment to issue

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics (Admin/Support only)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up MySQL database:
```bash
# Create database and run schema from windsurf-database/01_schema.sql
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Request rate limiting
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## Database

Uses MySQL with connection pooling for optimal performance. The database manager handles:
- Connection pooling
- Automatic reconnection
- Transaction support
- Query error handling

## Error Handling

Comprehensive error handling with:
- Global error middleware
- Specific database error handling
- JWT error handling
- Validation error formatting
- Detailed logging for debugging
