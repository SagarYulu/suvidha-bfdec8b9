
# Grievance Portal - Complete Migration Guide

A full-stack grievance management portal built with Node.js, Express, MySQL, React, and TypeScript. This project is completely independent of Supabase and ready for local or production deployment.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd grievance-portal
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE grievance_portal;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
exit

# Import schema
mysql -u grievance_user -p grievance_portal < windsurf-database/01_schema.sql

# (Optional) If migrating from Supabase, export and import your data
cd windsurf-database
npm install
npm run export
mysql -u grievance_user -p grievance_portal < 02_actual_data.sql
```

### 3. Backend Setup
```bash
cd windsurf-backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 4. Frontend Setup
```bash
cd windsurf-frontend
npm install
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
grievance-portal/
├── windsurf-backend/           # Node.js + Express API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Authentication & validation
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── scripts/                # Migration scripts
│   └── server.js               # Entry point
├── windsurf-frontend/          # React + TypeScript UI
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # API utilities
│   │   ├── types/              # TypeScript types
│   │   └── contexts/           # React contexts
│   └── dist/                   # Build output
├── windsurf-database/          # Database scripts & migration
│   ├── 01_schema.sql           # MySQL schema
│   ├── data-export-utility.js  # Supabase export tool
│   └── README.md               # Database documentation
└── README.md                   # This file
```

## 🗄️ Database Schema

### Core Tables
- **employees** - Employee master data
- **dashboard_users** - Admin/dashboard users
- **issues** - All grievance tickets
- **issue_comments** - Public comments on issues
- **issue_internal_comments** - Internal admin comments

### Master Data
- **master_cities** - City master data
- **master_clusters** - Cluster/region data
- **master_roles** - Role definitions

### RBAC System
- **rbac_roles** - Role-based access control roles
- **rbac_permissions** - System permissions
- **rbac_role_permissions** - Role-permission mappings
- **rbac_user_roles** - User-role assignments

### Audit & Feedback
- **ticket_feedback** - User feedback on resolved tickets
- **issue_audit_trail** - Complete audit trail for all issue changes
- **dashboard_user_audit_logs** - Admin user activity logs
- **master_audit_logs** - Master data change logs

## 🔧 Configuration

### Backend Environment Variables (.env)
```bash
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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
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

### Frontend Environment Variables (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Dashboard user login
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify JWT token

### Issue Management
- `GET /api/issues` - Get issues (with filters)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/employee/my-issues` - Get employee's issues

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/employees` - Get all employees
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/user/:id` - User-specific analytics

## 🔐 Default Credentials

After importing the schema, use these credentials:

### Admin Dashboard
- **Email**: admin@yulu.com
- **Password**: password

### Employee Login
- **Employee ID**: EMP001
- **Password**: EMP001

## 🚀 Production Deployment

### Backend Deployment (PM2)
```bash
cd windsurf-backend
npm install --production
pm2 start ecosystem.config.js
```

### Frontend Deployment (Nginx)
```bash
cd windsurf-frontend
npm run build
# Copy dist/ to your web server
```

### Docker Deployment
```bash
# Backend
cd windsurf-backend
docker build -t grievance-portal-backend .
docker run -p 5000:5000 grievance-portal-backend

# Frontend
cd windsurf-frontend
docker build -t grievance-portal-frontend .
docker run -p 80:80 grievance-portal-frontend

# Database (Optional)
cd windsurf-database
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd windsurf-backend
npm test
```

### Frontend Tests
```bash
cd windsurf-frontend
npm test
```

## 📊 Features

### Employee Portal
- ✅ Submit grievances with attachments
- ✅ Track ticket status and history
- ✅ Add comments and feedback
- ✅ View personal analytics

### Admin Dashboard
- ✅ Manage all tickets and assignments
- ✅ User management and RBAC
- ✅ Analytics and reporting
- ✅ Internal comments and notes
- ✅ Audit trail and compliance

### System Features
- ✅ Role-based access control (RBAC)
- ✅ File upload support
- ✅ Real-time status updates
- ✅ Comprehensive audit logging
- ✅ Mobile-responsive design
- ✅ RESTful API architecture

## 🔄 Migration from Supabase

If you're migrating from an existing Supabase setup:

1. **Export Data**: Use the data export utility in `windsurf-database/`
2. **Import Schema**: Run the MySQL schema file
3. **Import Data**: Import your exported data
4. **Update Config**: Point your app to the new MySQL database
5. **Test**: Verify all functionality works

See `windsurf-database/README.md` for detailed migration instructions.

## 🛠️ Development

### Adding New Features
1. **Backend**: Add routes → controllers → services
2. **Frontend**: Add pages → components → hooks
3. **Database**: Create migrations in `windsurf-database/`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- RESTful API design

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

For issues and questions:
1. Check the documentation
2. Review API responses and logs
3. Ensure database connectivity
4. Verify environment variables

---

**🎉 Your Grievance Portal is now completely independent and ready for deployment!**
