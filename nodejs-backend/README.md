
# Grievance Portal Backend

A Node.js backend API for the Grievance Portal application with MySQL database.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Issue Management**: Create, track, and manage grievance tickets
- **User Management**: Admin dashboard for user management
- **Analytics**: Dashboard metrics and reporting
- **File Uploads**: Support for ticket attachments
- **Audit Trail**: Complete tracking of all actions
- **Feedback System**: Ticket feedback and satisfaction tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   cd nodejs-backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```bash
   # Create database and tables
   npm run migrate
   
   # Or manually run the SQL files
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/sample_data.sql
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grievance_portal
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout

### Issues
- `GET /api/issues` - Get all issues (Admin/Manager)
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/employee/my-issues` - Get user's issues

### Users
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/issues` - Issue analytics
- `GET /api/analytics/performance` - Performance metrics

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/ticket/:ticketId` - Get feedback
- `GET /api/feedback/exists/:ticketId` - Check feedback exists

## Project Structure

```
nodejs-backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── issueController.js   # Issue management
│   ├── userController.js    # User management
│   ├── analyticsController.js
│   └── feedbackController.js
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── validation.js       # Request validation
│   └── errorHandler.js     # Global error handling
├── queries/
│   ├── authQueries.js      # Auth SQL queries
│   ├── issueQueries.js     # Issue SQL queries
│   ├── userQueries.js      # User SQL queries
│   ├── analyticsQueries.js
│   └── feedbackQueries.js
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── issueRoutes.js      # Issue endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── analyticsRoutes.js
│   └── feedbackRoutes.js
├── utils/
│   ├── helpers.js          # Utility functions
│   └── constants.js        # Application constants
├── database/
│   ├── schema.sql          # Database schema
│   └── sample_data.sql     # Sample data
├── scripts/
│   └── migrate.js          # Migration script
├── uploads/                # File uploads directory
├── server.js              # Application entry point
├── package.json
└── README.md
```

## Default Users

After running sample data migration:

### Admin
- Email: `admin@yulu.com`
- Password: `password123`

### Employee
- Employee ID: `EMP001`, `EMP002`, `EMP003`, `EMP004`
- Password: Same as Employee ID (e.g., `EMP001`)

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Run migration
npm run migrate
```

## Deployment

1. Set `NODE_ENV=production` in environment
2. Update database credentials
3. Configure reverse proxy (nginx recommended)
4. Set up SSL certificates
5. Configure process manager (PM2 recommended)

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "grievance-api"
pm2 startup
pm2 save
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- File upload restrictions

## Database Schema

The application uses the following main tables:
- `employees` - Employee information
- `dashboard_users` - Dashboard users (admin, managers, agents)
- `issues` - Grievance tickets
- `issue_comments` - Ticket comments
- `issue_audit_trail` - Action tracking
- `ticket_feedback` - User feedback

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License
