
# Windsurf Backend - Yulu Issue Resolution API

A clean, standard Node.js backend API for the Yulu Issue Resolution System.

## Features

- **Authentication**: JWT-based authentication
- **Issue Management**: CRUD operations for issues
- **User Management**: Employee/user management
- **Analytics**: Dashboard analytics and reporting
- **Security**: Rate limiting, CORS, input validation
- **Database**: MySQL with proper relationships

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE yulu_issues;
```

2. Run the schema:
```bash
mysql -u root -p yulu_issues < database/schema.sql
```

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the database credentials and other settings

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin)

### Issues
- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

## Project Structure

```
windsurf-backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── issues.js            # Issue management routes
│   ├── users.js             # User management routes
│   └── analytics.js         # Analytics routes
├── database/
│   └── schema.sql           # Database schema
├── uploads/                 # File uploads directory
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Environment Variables

- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - JWT secret key
- `FRONTEND_URL` - Frontend URL for CORS

## Default Admin User

- Email: `admin@yulu.com`
- Password: `admin123`
- Role: `admin`

Change this password immediately after setup!
