
# Grievance Portal Backend

Node.js/Express backend API for the Grievance Portal application.

## Features

- RESTful API endpoints
- JWT-based authentication
- Role-based access control
- File upload support
- MySQL database integration
- Rate limiting and security middleware
- Comprehensive error handling

## Prerequisites

- Node.js 16+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   # Create database and user in MySQL
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
   GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
   FLUSH PRIVILEGES;
   
   # Run migrations
   npm run migrate
   ```

4. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/verify` - Verify token

### Issues
- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/employee/my-issues` - Get employee's issues

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/employees` - Get all employees
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/user/:id` - Get user-specific analytics

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=grievance_portal
DB_USER=grievance_user
DB_PASSWORD=grievance_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

- **Employee**: Can create and view their own issues
- **Support**: Can view and manage all issues
- **Admin**: Full access to all endpoints

## File Uploads

Files are uploaded to the `uploads/` directory and served statically at `/uploads/`.

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Docker

```bash
# Build image
docker build -t grievance-backend .

# Run container
docker run -p 5000:5000 --env-file .env grievance-backend
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper database configuration
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure logging and monitoring

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- Password hashing with bcrypt
- JWT token expiration
