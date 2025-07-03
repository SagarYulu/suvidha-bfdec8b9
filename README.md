# Yulu Employee Issue Management System - Refactored

A complete full-stack application built with Node.js Express backend, React frontend, and MySQL database following clean MVC architecture.

## 🏗️ Architecture Overview

### Backend (Node.js + Express + MySQL)
```
backend/
├── config/               # Database & environment config
│   └── db.js             # MySQL connection with mysql2
├── controllers/          # Business logic
│   ├── authController.js
│   ├── employeeController.js
│   └── issueController.js
├── routes/              # RESTful API routes
│   ├── auth.js
│   ├── employees.js
│   └── issues.js
├── models/              # Database models
│   ├── User.js
│   ├── Employee.js
│   └── Issue.js
├── middlewares/         # Auth, error handlers
│   ├── auth.js
│   └── errorHandler.js
├── utils/               # Utilities
│   └── jwt.js
├── .env                 # Environment variables
├── package.json
└── server.js            # Application entry point
```

### Frontend (React + Tailwind)
```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Login.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/           # Route-level screens
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── IssuesList.jsx
│   │   └── EmployeesList.jsx
│   ├── services/        # API communication
│   │   └── api.js       # Axios-based API client
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env                 # Frontend environment
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- Git

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
# Copy and edit .env file
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=yulu_issue_management
DB_PORT=3306
JWT_SECRET=YuluJWTSecretKey2025ForIssueManagement
PORT=5000
```

3. **Start MySQL and create database:**
```sql
CREATE DATABASE yulu_issue_management;
```

4. **Start backend server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
# Edit .env file
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
```

3. **Start frontend:**
```bash
npm run dev
```

## 🔧 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Admin login
- `POST /employee-login` - Employee login
- `GET /profile` - Get current user profile
- `POST /logout` - Logout user

### Employees (`/api/v1/employees`)
- `GET /` - Get all employees (with filters)
- `GET /:id` - Get employee by ID
- `POST /` - Create new employee (admin only)
- `PUT /:id` - Update employee (admin only)
- `DELETE /:id` - Delete employee (admin only)
- `GET /stats` - Get employee statistics (admin only)
- `POST /bulk` - Bulk create employees (admin only)

### Issues (`/api/v1/issues`)
- `GET /` - Get all issues (with filters)
- `GET /:id` - Get issue by ID
- `POST /` - Create new issue
- `PUT /:id` - Update issue
- `DELETE /:id` - Delete issue (admin only)
- `GET /my-assigned` - Get current user's assigned issues
- `GET /stats` - Get issue statistics
- `PUT /:id/assign` - Assign issue (admin only)
- `PUT /:id/close` - Close issue

## 🔐 Authentication & Authorization

### JWT-based Authentication
- Secure token-based authentication
- Role-based access control (Admin, Employee)
- Protected routes with middleware

### User Roles
- **Admin**: Full system access, user management, issue management
- **Employee**: Create and view own issues, limited access

## 🗄️ Database Schema

### Key Tables
- `users` - Authentication data
- `employees` - Employee information
- `dashboard_users` - Admin users
- `issues` - Issue tracking
- `issue_comments` - Issue communication
- `ticket_feedback` - Customer feedback

### Features
- Integer-based AUTO_INCREMENT IDs (no UUIDs)
- Foreign key constraints with CASCADE deletes
- Proper indexing for performance
- Timestamp tracking for auditing

## 🎨 Frontend Features

### Modern React Stack
- React 18 with hooks
- React Router for navigation
- Context API for state management
- Axios for API communication

### Tailwind CSS Styling
- Responsive design
- Component-based styling
- Clean, professional UI
- Mobile-first approach

## 🔒 Security Features

- **CORS** protection
- **Helmet** security headers
- **Rate limiting** on API endpoints
- **JWT** token validation
- **Input validation** with Joi
- **Password hashing** with bcrypt
- **SQL injection** protection

## 📦 Deployment

### Environment Variables
Make sure to set these in production:

**Backend:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT=5000`

**Frontend:**
- `REACT_APP_API_BASE_URL=https://yourdomain.com/api/v1`

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend  
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Testing
```bash
# Register admin user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📋 Migration Notes

This refactored version includes:

✅ **Complete MVC Architecture**
- Clean separation of concerns
- Modular, scalable structure
- Production-ready code organization

✅ **MySQL Integration**
- Replaced PostgreSQL/Supabase with MySQL
- Auto-increment integer IDs
- Proper foreign key relationships

✅ **JWT Authentication**
- Secure token-based auth
- Role-based access control
- Session management

✅ **Modern Frontend**
- React with hooks and context
- Axios API integration
- Responsive Tailwind design

✅ **Security & Production Ready**
- Input validation
- Error handling
- Security middleware
- Environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.