
# Issue Tracker Backend API

A comprehensive Node.js Express backend API for the Issue Tracker application, designed to replace Supabase with a MySQL-based solution.

## 🏗️ Architecture

This backend follows a clean **MVC (Model-View-Controller)** architecture with proper separation of concerns:

```
backend/
├── config/          # Database and application configuration
├── controllers/     # Request handlers and business logic
├── middlewares/     # Authentication, validation, error handling
├── models/          # Database models and query logic
├── routes/          # Express route definitions
├── services/        # Business logic and reusable operations
├── utils/           # Helper utilities and validators
└── server.js        # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials and JWT secret
   ```

3. **Database setup:**
   - Create a MySQL database named `issue_tracker_db`
   - Run the migration script from the data migration tool
   - Ensure all 17 tables are created

4. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📊 Database Tables

The API works with these MySQL tables:
- `employees` - Employee information
- `issues` - Support tickets and issues
- `dashboard_users` - Admin/agent users
- `issue_comments` - Public comments on issues
- `issue_internal_comments` - Internal staff comments
- `issue_audit_trail` - Change tracking
- `issue_notifications` - System notifications
- `ticket_feedback` - Customer feedback
- `master_cities` - City master data
- `master_clusters` - Cluster/branch data
- `master_roles` - Role definitions
- `rbac_*` - Role-based access control tables

## 🔐 Authentication & Authorization

### JWT Authentication
All protected routes require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control (RBAC)
Four main roles:
- **Admin**: Full system access
- **Manager**: Team management and reporting
- **Agent**: Issue handling and resolution
- **Employee**: Create and view own issues

### Permission System
Granular permissions include:
- `read`, `write`, `delete`
- `manage_users`, `manage_roles`
- `view_analytics`, `escalate_issues`
- `assign_issues`

## 📚 API Endpoints

### Authentication (`/api/auth`)
```
POST   /login              # User login
POST   /register           # User registration
POST   /logout             # User logout
GET    /me                 # Current user info
POST   /change-password    # Change password
POST   /refresh-token      # Refresh JWT token
POST   /forgot-password    # Password reset request
POST   /reset-password     # Password reset confirmation
```

### Issues (`/api/issues`)
```
GET    /                   # List issues (with filtering)
GET    /:id                # Get specific issue
POST   /                   # Create new issue
PUT    /:id                # Update issue
DELETE /:id                # Delete issue (admin/manager only)

PATCH  /:id/status         # Update issue status
PATCH  /:id/assign         # Assign issue to user
PATCH  /:id/priority       # Update issue priority
POST   /:id/reopen         # Reopen closed issue
POST   /:id/escalate       # Escalate issue

GET    /:id/comments       # Get issue comments
POST   /:id/comments       # Add comment
PUT    /comments/:id       # Update comment
DELETE /comments/:id       # Delete comment

GET    /stats/overview     # Issue statistics
GET    /stats/trends       # Issue trends
GET    /:id/audit          # Issue audit trail

POST   /bulk/assign        # Bulk assign issues
POST   /bulk/update-status # Bulk status update
POST   /bulk/update-priority # Bulk priority update
```

### Users (`/api/users`)
```
GET    /                   # List users
GET    /:id                # Get user details
POST   /                   # Create user
PUT    /:id                # Update user
DELETE /:id                # Delete user
GET    /:id/permissions    # Get user permissions
POST   /:id/roles          # Assign roles
```

### Employees (`/api/employees`)
```
GET    /                   # List employees
GET    /:id                # Get employee details
POST   /                   # Create employee
PUT    /:id                # Update employee
DELETE /:id                # Delete employee
```

### Analytics (`/api/analytics`)
```
GET    /dashboard          # Dashboard statistics
GET    /issues             # Issue analytics
GET    /performance        # Performance metrics
GET    /trends             # Trend analysis
```

### Master Data (`/api/master-data`)
```
GET    /cities             # List cities
GET    /clusters           # List clusters
GET    /roles              # List roles
POST   /cities             # Create city
POST   /clusters           # Create cluster
```

## 🔧 Request/Response Format

### Standard Response Format
```json
{
  "message": "Success message",
  "data": {
    // Response data
  },
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": [  // For validation errors
    {
      "field": "email",
      "message": "Must be a valid email",
      "value": "invalid-email"
    }
  ]
}
```

## 🔍 Filtering & Pagination

### Query Parameters
```
?page=1&limit=10          # Pagination
?status=open,in_progress  # Filter by status
?priority=high,urgent     # Filter by priority
?search=keyword           # Search in title/description
?assigned_to=user-id      # Filter by assignee
?date_from=2024-01-01     # Date range filtering
?date_to=2024-12-31
?sort_by=created_at       # Sort field
?sort_order=desc          # Sort direction
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Joi/express-validator
- **SQL Injection Protection**: Parameterized queries
- **Password Hashing**: bcryptjs
- **JWT Security**: Proper token handling

## 📈 Monitoring & Logging

- Request/response logging
- Error tracking with stack traces
- Performance monitoring
- Health check endpoint (`/api/health`)

## 🚀 Deployment

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=issue_tracker_db

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure database connection pooling
- [ ] Set up process monitoring (PM2)
- [ ] Configure log rotation
- [ ] Set up backup procedures
- [ ] Configure firewall rules

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoints
curl -X GET http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 📞 Support

For issues or questions about the backend API:
1. Check the error logs
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check JWT token validity
5. Verify user permissions

---

**Built with ❤️ using Node.js, Express, and MySQL**
