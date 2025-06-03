
# Yulu Suvidha Backend Logic

This directory contains all the extracted authentication and business logic from your Lovable project, organized for easy implementation in any Node.js/Express backend.

## 📁 Directory Structure

```
extracted-backend-logic/
├── auth/                     # Authentication logic
│   ├── authService.js        # Core authentication service
│   └── authContext.js        # Authentication state management
├── issues/                   # Issue management logic
│   └── issueService.js       # Issue CRUD operations
├── users/                    # User management logic
│   └── userService.js        # User operations
├── rbac/                     # Role-based access control
│   └── rbacService.js        # Permission and role management
├── feedback/                 # Feedback system logic
│   └── feedbackService.js    # Feedback operations
├── middleware/               # Express middleware
│   └── authMiddleware.js     # Authentication & authorization middleware
├── routes/                   # API route definitions
│   ├── authRoutes.js         # Authentication endpoints
│   └── issueRoutes.js        # Issue management endpoints
├── config/                   # Configuration
│   └── database.js           # Database schema and configuration
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Features Extracted

### Authentication System
- **Multi-tier authentication**: Mock users, dashboard users, employees
- **Role-based access control**: Different access levels for mobile vs admin
- **JWT token management**: Secure token generation and validation
- **Session management**: Persistent authentication state

### Issue Management
- **CRUD operations**: Create, read, update, delete issues
- **Comment system**: Add comments to issues
- **Status tracking**: Issue lifecycle management
- **Audit trail**: Complete history of issue changes

### User Management
- **User profiles**: Employee and dashboard user management
- **Permission system**: Fine-grained access control
- **Role assignment**: Dynamic role-based permissions

### Security Features
- **Access restrictions**: Email and role-based access control
- **JWT authentication**: Stateless authentication
- **Rate limiting**: API abuse prevention
- **Input validation**: Secure data handling

## 🛠 Implementation Guide

### 1. Database Setup
Create your database tables using the schema in `config/database.js`:

```sql
-- Use the CREATE TABLE statements from database.js
-- Set up your MySQL/PostgreSQL database
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database and JWT configuration
```

### 4. Start Development Server
```bash
npm run dev
```

## 📊 Database Schema

The extracted logic requires these main tables:
- `employees` - Employee user data
- `dashboard_users` - Admin/management users
- `issues` - Issue tracking
- `issue_comments` - Issue comments
- `issue_audit_trail` - Change history
- `ticket_feedback` - Feedback system
- `rbac_*` - Role-based access control tables

## 🔐 Authentication Flow

### Mobile App Login
1. POST `/api/auth/mobile/login` with email + employeeId
2. Server validates credentials against employees table
3. Checks access restrictions (no admin roles allowed)
4. Returns JWT token for mobile access

### Admin Dashboard Login
1. POST `/api/auth/admin/login` with email + password
2. Server validates against dashboard_users table
3. Checks admin role requirements
4. Returns JWT token for admin access

## 🛡 Security Considerations

### Access Control Rules
- **Mobile App**: Only regular employees, no admin roles
- **Admin Dashboard**: Only users with admin/management roles
- **Restricted Emails**: Certain emails blocked from mobile access

### JWT Security
- Tokens expire in 24 hours
- Include user ID, email, name, and role in payload
- Use strong secret key for signing

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/mobile/login` - Mobile login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Issues
- `GET /api/issues/user/:userId` - Get user issues
- `GET /api/issues/:issueId` - Get specific issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:issueId/status` - Update status
- `POST /api/issues/:issueId/comments` - Add comment

### Users
- `GET /api/users/profile` - Get user profile

### Feedback
- `POST /api/feedback` - Submit feedback

## 🔧 Customization

### Adding New Routes
1. Create route file in `/routes/`
2. Add route setup in `server.js`
3. Implement service logic

### Modifying Authentication
- Update `authService.js` for new auth methods
- Modify `authMiddleware.js` for different access rules
- Adjust role checks in route handlers

### Database Changes
- Update schema in `config/database.js`
- Modify service classes for new fields
- Update route handlers accordingly

## 📝 Notes

- This is a complete extraction of your Lovable project's backend logic
- All authentication flows and business rules are preserved
- Database queries are abstracted for easy database adapter changes
- Middleware provides the same security checks as your original app
- Ready for deployment with proper database connection setup

## 🚀 Next Steps

1. Set up your preferred database (MySQL, PostgreSQL, etc.)
2. Implement the database connection in the service classes
3. Add any additional business logic you need
4. Deploy to your preferred hosting platform
5. Update your frontend to call these API endpoints instead of Supabase

This extracted logic gives you complete control over your backend while maintaining all the functionality from your Lovable project!
