
# Grievance Portal - Windsurf Development

A complete grievance management system built with **Express.js MVC architecture**, **MySQL**, and **React with TypeScript**. This is a **production-ready implementation** with full three-layer architecture, real-time features, comprehensive admin dashboard, and mobile application.

## 🏗️ **Triple-Layer MVC Architecture**

### **Layer 1: Presentation Layer (Frontend)**
- **React with TypeScript**: Modern component-based UI
- **Tailwind CSS**: Utility-first styling framework
- **React Router**: Client-side routing for SPA
- **Shadcn/UI**: Comprehensive component library
- **React Query**: Server state management
- **Authentication Context**: JWT-based auth management

### **Layer 2: Business Logic Layer (Backend)**
- **Express.js MVC**: Clean separation of concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Middleware**: Authentication, validation, RBAC
- **Models**: Data access layer
- **Routes**: API endpoint definitions

### **Layer 3: Data Access Layer (Database)**
- **MySQL 8.0**: Relational database
- **Connection Pooling**: Optimized database connections
- **Migration System**: Version-controlled schema changes
- **Indexes & Constraints**: Performance optimization
- **Stored Procedures**: Complex query optimization

## 🚀 **Quick Start (5 Minutes)**

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0 (if running locally)

### **1. Clone and Setup**
```bash
git clone <repository-url>
cd windsurf-development
cp .env.example .env
cp windsurf-frontend/.env.example windsurf-frontend/.env
cp windsurf-backend/.env.example windsurf-backend/.env
```

### **2. Configure Environment Variables**

**Root `.env`:**
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=grievance_user
MYSQL_PASSWORD=grievance_password
MYSQL_DATABASE=grievance_portal
JWT_SECRET=your-super-secret-jwt-key
```

**Backend `.env`:**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=grievance_user
DB_PASSWORD=grievance_password
DB_NAME=grievance_portal
DB_PORT=3306

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yulu.com

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

**Frontend `.env`:**
```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Environment
VITE_ENV=development

# Application Configuration
VITE_APP_NAME=Yulu Suvidha Portal
VITE_DEFAULT_LOCALE=en

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_FEEDBACK=true
VITE_ENABLE_NOTIFICATIONS=true

# Development
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### **3. Start with Docker (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **4. Manual Setup (Alternative)**
```bash
# Install dependencies
npm run setup

# Start backend
npm run dev:backend

# Start frontend (in new terminal)
npm run dev:frontend
```

### **5. Access the Application**
- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login
- **Mobile App**: http://localhost:3000/mobile/login
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔐 **Default Access Credentials**

### **Admin Dashboard Access**
- **Email**: `admin@yulu.com`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full system administration

### **Mobile App Access (Employee)**
- **Email**: Any valid employee email
- **Employee ID**: Use as password
- **Example**: `employee@yulu.com` / `EMP001`
- **Access**: Issue submission and tracking

## 📁 **Complete Project Structure**

```
windsurf-development/
├── windsurf-backend/              # Express.js MVC Backend
│   ├── controllers/               # Request handlers
│   │   ├── authController.js      # Authentication logic
│   │   ├── issueController.js     # Issue management
│   │   ├── userController.js      # User operations
│   │   ├── analyticsController.js # Analytics endpoints
│   │   └── mobileController.js    # Mobile API handlers
│   ├── models/                    # Data access layer
│   │   ├── userModel.js          # User data operations
│   │   ├── issueModel.js         # Issue data operations
│   │   └── feedbackModel.js      # Feedback data operations
│   ├── services/                  # Business logic layer
│   │   ├── authService.js        # Authentication business logic
│   │   ├── issueService.js       # Issue processing logic
│   │   ├── emailService.js       # Email notification service
│   │   └── analyticsService.js   # Analytics computation
│   ├── routes/                    # API route definitions
│   │   ├── api/                  # Organized API routes
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── issues.js         # Issue management routes
│   │   │   ├── analytics.js      # Analytics routes
│   │   │   └── health.js         # Health check routes
│   │   └── mobile.js             # Mobile app routes
│   ├── middleware/                # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── rbac.js               # Role-based access control
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   ├── config/                    # Configuration files
│   │   └── database.js           # MySQL connection config
│   ├── migrations/                # Database migrations
│   └── app.js                    # Main application entry
├── windsurf-frontend/             # React TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── ui/              # Base UI components
│   │   │   ├── layouts/         # Layout components
│   │   │   ├── admin/           # Admin-specific components
│   │   │   └── mobile/          # Mobile-specific components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── mobile/          # Mobile app pages
│   │   │   ├── Index.tsx        # Landing page
│   │   │   └── NotFound.tsx     # 404 page
│   │   ├── contexts/            # React contexts
│   │   │   ├── AuthContext.tsx  # Authentication context
│   │   │   └── RBACContext.tsx  # Role-based access context
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.tsx      # Authentication hook
│   │   │   └── useDashboardData.tsx # Dashboard data hook
│   │   ├── services/            # API service layer
│   │   │   ├── authService.ts   # Authentication API calls
│   │   │   ├── issueService.ts  # Issue management API
│   │   │   ├── apiService.ts    # Base API service
│   │   │   └── config.ts        # API configuration
│   │   ├── utils/               # Utility functions
│   │   │   ├── constants.ts     # Application constants
│   │   │   └── formatUtils.ts   # Data formatting utilities
│   │   └── types/               # TypeScript type definitions
│   └── vite.config.ts           # Vite configuration
├── windsurf-database/             # Database management
│   ├── migrations/               # Schema migrations
│   │   ├── 001_initial_schema.sql # Base schema
│   │   └── 002_add_master_data_tables.sql # Additional tables
│   ├── windsurf-sql/            # SQL scripts
│   │   ├── schema.sql           # Complete schema
│   │   ├── enhanced-schema.sql  # Enhanced features schema
│   │   └── data_migration.sql   # Data migration scripts
│   └── README.md                # Database documentation
├── docker-compose.yml            # Development Docker config
├── docker-compose.prod.yml       # Production Docker config
└── package.json                  # Root package configuration
```

## 🎯 **Complete Feature Set**

### **🔧 Core Functionality**
- ✅ **Ticket Management**: Create, track, and resolve grievances
- ✅ **Real-time Updates**: Live status changes via WebSocket
- ✅ **Comment System**: Public comments and internal notes
- ✅ **File Attachments**: Multiple file type support
- ✅ **Email Notifications**: Automated status updates
- ✅ **Mobile-first Design**: Responsive across all devices

### **🚀 Advanced Features**
- ✅ **Auto-assignment**: Location-based ticket routing
- ✅ **SLA Monitoring**: TAT tracking and breach alerts
- ✅ **Escalation Workflows**: Automated escalation rules
- ✅ **Analytics Dashboard**: Comprehensive reporting
- ✅ **Role-based Access**: Fine-grained permissions
- ✅ **Audit Trails**: Complete activity logging
- ✅ **Feedback System**: Post-resolution feedback collection

### **👥 Admin Dashboard**
- ✅ **User Management**: Bulk upload and role assignment
- ✅ **Issue Analytics**: Performance metrics and trends
- ✅ **Workload Distribution**: Team performance monitoring
- ✅ **Feedback Analysis**: Sentiment analysis and insights
- ✅ **System Settings**: Configuration management
- ✅ **Export Tools**: Data export capabilities

### **📱 Mobile Application**
- ✅ **Dedicated Mobile UI**: Optimized mobile experience
- ✅ **Employee Self-service**: Direct issue submission
- ✅ **Status Tracking**: Real-time issue monitoring
- ✅ **Photo Attachments**: Mobile camera integration
- ✅ **Push Notifications**: Instant status updates
- ✅ **Offline Support**: Basic offline functionality

## 🛠️ **Complete API Documentation**

### **Authentication Endpoints**
```
POST /api/auth/login           # Admin dashboard login
POST /api/auth/mobile-login    # Mobile app login
GET  /api/auth/profile         # Get user profile
POST /api/auth/refresh         # Refresh authentication token
POST /api/auth/logout          # Logout user
```

### **Issue Management Endpoints**
```
GET    /api/issues             # List all issues (admin)
POST   /api/issues             # Create new issue
GET    /api/issues/:id         # Get issue details
PUT    /api/issues/:id         # Update issue
DELETE /api/issues/:id         # Delete issue
POST   /api/issues/:id/comments          # Add public comment
POST   /api/issues/:id/internal-comments # Add internal note
PUT    /api/issues/:id/assign            # Assign issue
PUT    /api/issues/:id/status            # Update status
```

### **Mobile API Endpoints**
```
GET  /api/mobile/issues/:employeeId      # Employee's issues
GET  /api/mobile/issue/:id               # Mobile issue details
POST /api/mobile/issues                  # Create issue via mobile
GET  /api/mobile/profile/:employeeId     # Employee profile
POST /api/mobile/feedback                # Submit feedback
```

### **Analytics & Reporting**
```
GET /api/analytics/dashboard             # Dashboard metrics
GET /api/analytics/tat                   # TAT analytics
GET /api/analytics/trends                # Trend analysis
GET /api/analytics/performance           # Team performance
GET /api/analytics/feedback              # Feedback analytics
```

### **User Management**
```
GET    /api/users                        # List users
POST   /api/users                        # Create user
PUT    /api/users/:id                    # Update user
DELETE /api/users/:id                    # Delete user
POST   /api/users/bulk-upload            # Bulk user upload
```

### **System Health**
```
GET /api/health                          # Basic health check
GET /api/health/detailed                 # Detailed system status
GET /api/health/database                 # Database connectivity
```

## 🔧 **Local Development Setup**

### **Backend Development**
```bash
cd windsurf-backend
npm install
npm run dev                    # Start with nodemon
npm start                      # Start production mode
npm test                       # Run tests
npm run lint                   # Code linting
```

### **Frontend Development**
```bash
cd windsurf-frontend
npm install
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm test                       # Run tests
npm run lint                   # Code linting
```

### **Database Management**
```bash
cd windsurf-database
npm install
npm run migrate                # Run migrations
npm run seed                   # Seed test data
npm run verify                 # Verify database setup
```

## 📊 **System Monitoring & Health Checks**

### **Application Health Monitoring**
```bash
# Backend API health
curl http://localhost:5000/api/health

# Detailed system status
curl http://localhost:5000/api/health/detailed

# Database connectivity
curl http://localhost:5000/api/health/database

# Frontend application
curl http://localhost:3000
```

### **Docker Container Monitoring**
```bash
# Check all services status
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Follow real-time logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
```

### **Database Health Verification**
```bash
# Direct MySQL connection test
mysql -h localhost -u grievance_user -p grievance_portal -e "SELECT 1"

# Table structure verification
mysql -h localhost -u grievance_user -p grievance_portal -e "SHOW TABLES"

# Data verification
mysql -h localhost -u grievance_user -p grievance_portal -e "SELECT COUNT(*) FROM users"
```

## 🚢 **Production Deployment Guide**

### **1. Production Environment Setup**
```bash
# Copy production environment files
cp .env.example .env.production
cp windsurf-backend/.env.example windsurf-backend/.env.production
cp windsurf-frontend/.env.example windsurf-frontend/.env.production

# Update production configuration
# - Set NODE_ENV=production
# - Configure production database
# - Set secure JWT secrets
# - Configure production SMTP
# - Set up SSL certificates
```

### **2. Production Build & Deploy**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

### **3. Production Configuration Checklist**
- [ ] **Environment Variables**: All production values set
- [ ] **Database**: Production MySQL instance configured
- [ ] **SSL/HTTPS**: SSL certificates installed
- [ ] **Domain**: DNS records pointing to server
- [ ] **CORS**: Production origins configured
- [ ] **Email**: Production SMTP service configured
- [ ] **File Storage**: AWS S3 or production storage configured
- [ ] **Monitoring**: Application monitoring tools configured
- [ ] **Backups**: Database backup strategy implemented
- [ ] **Security**: Firewall rules and security measures applied

## 🔐 **Security Implementation**

### **Authentication & Authorization**
- ✅ **JWT Tokens**: Secure token-based authentication
- ✅ **Password Hashing**: bcrypt password encryption
- ✅ **Role-based Access**: Fine-grained permission system
- ✅ **Session Management**: Secure session handling
- ✅ **Token Refresh**: Automatic token renewal

### **Data Protection**
- ✅ **Input Validation**: Comprehensive request validation
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: Content Security Policy headers
- ✅ **CORS Configuration**: Controlled cross-origin access
- ✅ **Rate Limiting**: API request throttling

### **Infrastructure Security**
- ✅ **Environment Secrets**: Secure credential management
- ✅ **Database Security**: Connection encryption and access control
- ✅ **File Upload Security**: Type validation and size limits
- ✅ **Error Handling**: Secure error messages
- ✅ **Audit Logging**: Complete activity tracking

## 📈 **Performance Optimizations**

### **Database Performance**
- ✅ **Connection Pooling**: Optimized database connections
- ✅ **Query Optimization**: Efficient SQL queries
- ✅ **Indexing Strategy**: Proper database indexes
- ✅ **Query Caching**: Result caching implementation

### **Frontend Performance**
- ✅ **Code Splitting**: Lazy loading of components
- ✅ **Bundle Optimization**: Optimized build output
- ✅ **Caching Strategy**: Browser and API caching
- ✅ **Image Optimization**: Optimized image delivery

### **Backend Performance**
- ✅ **Response Compression**: Gzip compression
- ✅ **Caching Layer**: Redis caching implementation
- ✅ **WebSocket Optimization**: Efficient real-time communication
- ✅ **Memory Management**: Optimized memory usage

## 🧪 **Testing & Quality Assurance**

### **API Testing Suite**
```bash
# Authentication flow test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yulu.com","password":"admin123"}'

# Mobile authentication test
curl -X POST http://localhost:5000/api/auth/mobile-login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@yulu.com","employeeId":"EMP001"}'

# Issue creation test
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Issue","description":"Test Description","category":"General"}'
```

### **Frontend Testing**
```bash
# Build verification
cd windsurf-frontend && npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm test
```

### **Database Testing**
```bash
# Schema verification
mysql -u grievance_user -p grievance_portal \
  -e "DESCRIBE users; DESCRIBE issues; DESCRIBE issue_comments;"

# Data integrity test
mysql -u grievance_user -p grievance_portal \
  -e "SELECT COUNT(*) as user_count FROM users; 
      SELECT COUNT(*) as issue_count FROM issues;"
```

## 🆘 **Comprehensive Troubleshooting Guide**

### **Common Database Issues**

**Connection Failed**
```bash
# Check MySQL service
docker-compose logs mysql

# Verify MySQL is running
docker-compose ps mysql

# Test connection manually
mysql -h localhost -u grievance_user -p

# Reset MySQL container
docker-compose down
docker-compose up mysql
```

**Migration Errors**
```bash
# Check migration status
cd windsurf-database
npm run verify

# Re-run migrations
npm run migrate

# Manual migration
mysql -u grievance_user -p grievance_portal < migrations/001_initial_schema.sql
```

### **Backend Service Issues**

**API Not Responding**
```bash
# Check backend service logs
docker-compose logs backend

# Verify environment variables
cat windsurf-backend/.env

# Test health endpoint
curl http://localhost:5000/api/health

# Restart backend service
docker-compose restart backend
```

**Authentication Issues**
```bash
# Verify JWT secret configuration
grep JWT_SECRET windsurf-backend/.env

# Check user credentials in database
mysql -u grievance_user -p grievance_portal \
  -e "SELECT email, role FROM users WHERE email='admin@yulu.com'"

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yulu.com","password":"admin123"}' -v
```

### **Frontend Application Issues**

**Build Errors**
```bash
# Clear dependencies and reinstall
cd windsurf-frontend
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
cat .env
```

**Routing Issues**
```bash
# Verify React Router configuration
grep -r "Routes\|Route" src/

# Check for 404 handling
curl http://localhost:3000/nonexistent-route

# Verify navigation components
grep -r "Navigate\|Link" src/components/
```

### **Docker & Container Issues**

**Container Startup Problems**
```bash
# Check all container status
docker-compose ps

# View container logs
docker-compose logs --tail=50

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
netstat -tulpn | grep :3306

# Stop conflicting services
docker-compose down
sudo systemctl stop mysql
sudo systemctl stop apache2
```

### **File Upload Issues**

**Upload Directory Problems**
```bash
# Create upload directories
mkdir -p windsurf-backend/uploads
chmod 755 windsurf-backend/uploads

# Check upload configuration
grep UPLOAD windsurf-backend/.env

# Verify file permissions
ls -la windsurf-backend/uploads/
```

## 📋 **Data Migration & Import Guide**

### **Bulk User Import**
1. Access admin dashboard: http://localhost:3000/admin/users
2. Click "Bulk Upload" button
3. Download CSV template
4. Fill user data in CSV format
5. Upload and validate data
6. Review and confirm import

### **Issue Data Migration**
```bash
# Export existing data to CSV
curl http://localhost:5000/api/export/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o issues_export.csv

# Import data via API
curl -X POST http://localhost:5000/api/import/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@issues_data.csv"
```

### **Database Backup & Restore**
```bash
# Create backup
mysqldump -u grievance_user -p grievance_portal > backup.sql

# Restore from backup
mysql -u grievance_user -p grievance_portal < backup.sql

# Automated backup script
docker exec grievance_mysql_windsurf mysqldump \
  -u grievance_user -pgrievance_password grievance_portal \
  > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

## 🤝 **Development Contribution Guide**

### **Code Standards**
- **JavaScript/TypeScript**: ESLint + Prettier
- **React**: Function components with hooks
- **CSS**: Tailwind CSS utility classes
- **API**: RESTful conventions
- **Database**: Normalized schema design

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature

# Create Pull Request
# Review and merge
```

### **Testing Requirements**
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical flows

## 📄 **License & Support**

**License**: MIT License

**Support Resources**:
- Health Endpoint: `/api/health` for system status
- Application Logs: `docker-compose logs [service]`
- Database Status: MySQL connectivity checks
- Environment Config: Verify all `.env` files

---

## 🎉 **Current Deployment Status**

**✅ PRODUCTION READY** | **✅ FEATURE COMPLETE** | **✅ MOBILE OPTIMIZED** | **✅ DOCKER READY**

**Architecture**: Complete MVC with three-layer separation
**Version**: 2.0.0 | **Last Updated**: December 2024

This is a **complete, production-ready** grievance management system with full triple-layer MVC architecture, comprehensive mobile and admin capabilities, and enterprise-grade deployment readiness.

### **Immediate Action Items**
1. **Environment Setup**: Configure your `.env` files
2. **Start Services**: Run `docker-compose up -d`
3. **Access Application**: Visit http://localhost:3000
4. **Admin Login**: Use admin@yulu.com / admin123
5. **Mobile Access**: Visit http://localhost:3000/mobile/login

**🚀 Ready to execute and deploy immediately!**
