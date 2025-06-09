
# Grievance Portal - Windsurf Development

A complete grievance management system built with Express.js, MySQL, and React. This is a **production-ready implementation** with full MVC architecture, real-time features, comprehensive admin dashboard, and mobile application.

## 🏗️ Architecture

- **Backend**: Express.js with MVC pattern
- **Database**: MySQL 8.0 with comprehensive schema
- **Frontend**: React with TypeScript and Tailwind CSS
- **Mobile App**: Responsive mobile interface with dedicated endpoints
- **Real-time**: WebSocket integration for live updates
- **Authentication**: JWT-based auth with role-based access control
- **File Storage**: Configurable local/AWS S3 storage
- **Email**: SMTP notifications with templates
- **Containerization**: Docker & Docker Compose ready

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0 (if running locally)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd windsurf-development
cp .env.example .env
cp windsurf-frontend/.env.example windsurf-frontend/.env
cp windsurf-backend/.env.example windsurf-backend/.env
```

### 2. Configure Environment
Edit the `.env` files with your configuration:

**Root `.env`:**
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

**Backend `.env`:**
```env
# Database
DB_HOST=localhost
DB_USER=grievance_user
DB_PASSWORD=your_secure_password
DB_NAME=grievance_portal

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Yulu Suvidha Portal
VITE_ENV=development
```

### 3. Start with Docker
```bash
docker-compose up -d
```

### 4. Access the Application
- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login
- **Mobile App**: http://localhost:3000/mobile/login
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔐 Default Access Credentials

### Admin Dashboard
- **Email**: `admin@yulu.com`
- **Password**: `admin123`
- **Role**: Super Admin

### Mobile App (Employee Access)
- **Email**: Any valid employee email
- **Employee ID**: Use employee ID as password
- **Example**: `employee@yulu.com` / `EMP001`

## 📁 Project Structure

```
windsurf-development/
├── windsurf-backend/           # Express.js Backend
│   ├── controllers/            # Route controllers
│   ├── models/                # Database models
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Auth & validation
│   ├── config/                # Configuration
│   └── app.js                 # Main application
├── windsurf-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
├── windsurf-database/         # Database setup & migrations
└── docker-compose.yml        # Docker configuration
```

## 🎯 Features

### Core Functionality
- ✅ **Ticket Management**: Create, track, and resolve grievances
- ✅ **Real-time Updates**: Live status changes and notifications
- ✅ **Comment System**: Public comments and internal notes
- ✅ **File Attachments**: Support for multiple file types
- ✅ **Email Notifications**: Automated status updates
- ✅ **Mobile-first Design**: Responsive across all devices

### Advanced Features
- ✅ **Auto-assignment**: Location-based ticket routing
- ✅ **SLA Monitoring**: TAT tracking and breach alerts
- ✅ **Escalation Workflows**: Automated escalation rules
- ✅ **Analytics Dashboard**: Comprehensive reporting
- ✅ **Role-based Access**: Fine-grained permissions
- ✅ **Audit Trails**: Complete activity logging
- ✅ **Feedback System**: Post-resolution feedback collection

### Admin Dashboard
- ✅ **User Management**: Bulk upload and role assignment
- ✅ **Issue Analytics**: Performance metrics and trends
- ✅ **Workload Distribution**: Team performance monitoring
- ✅ **Feedback Analysis**: Sentiment analysis and insights
- ✅ **System Settings**: Configuration management
- ✅ **Export Tools**: Data export capabilities

### Mobile Application
- ✅ **Dedicated Mobile UI**: Optimized mobile experience
- ✅ **Employee Self-service**: Direct issue submission
- ✅ **Status Tracking**: Real-time issue monitoring
- ✅ **Photo Attachments**: Mobile camera integration
- ✅ **Push Notifications**: Instant status updates
- ✅ **Offline Support**: Basic offline functionality

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - Admin dashboard login
- `POST /api/auth/mobile-login` - Mobile app login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh authentication token

### Issues Management
- `GET /api/issues` - List all issues (admin)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/comments` - Add comment
- `POST /api/issues/:id/internal-comments` - Add internal note

### Mobile API
- `GET /api/mobile/issues/:employeeId` - Employee's issues
- `GET /api/mobile/issue/:id` - Mobile issue details
- `POST /api/mobile/issues` - Create issue via mobile
- `GET /api/mobile/profile/:employeeId` - Employee profile

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/tat` - TAT analytics
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/performance` - Team performance

### System Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## 🔧 Local Development

### Backend Development
```bash
cd windsurf-backend
npm install
npm run dev
```

### Frontend Development
```bash
cd windsurf-frontend
npm install
npm run dev
```

### Database Setup
```bash
# Initialize database
mysql -u root -p < windsurf-database/migrations/001_initial_schema.sql

# Run additional migrations
mysql -u root -p grievance_portal < windsurf-database/windsurf-sql/enhanced-schema.sql
```

## 📊 Monitoring & Health Checks

### Application Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend build check
curl http://localhost:3000
```

### Database Health
```bash
# Connection test
mysql -u grievance_user -p grievance_portal -e "SELECT 1"

# Table verification
mysql -u grievance_user -p grievance_portal -e "SHOW TABLES"
```

### Log Monitoring
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs mysql
```

## 🚢 Production Deployment

### 1. Environment Setup
```bash
# Use production environment files
cp .env.example .env.production
# Configure production values
```

### 2. Build & Deploy
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Production Configuration
- **SSL/HTTPS**: Configure reverse proxy (nginx/Apache)
- **Domain Setup**: Update CORS origins and redirect URLs
- **Database**: Use managed MySQL instance
- **File Storage**: Configure AWS S3 for file uploads
- **Email**: Configure production SMTP service
- **Monitoring**: Set up application monitoring

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Controlled cross-origin access
- **Environment Secrets**: Secure credential management
- **Role-based Authorization**: Fine-grained access control

## 📈 Performance Optimizations

- **Database**: Connection pooling and query optimization
- **Frontend**: Code splitting and lazy loading
- **Caching**: Response caching and static file optimization
- **Compression**: Gzip compression for API responses
- **WebSocket**: Efficient real-time communication
- **CDN Ready**: Static asset optimization

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Authentication test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yulu.com","password":"admin123"}'

# Mobile login test
curl -X POST http://localhost:5000/api/auth/mobile-login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@yulu.com","employeeId":"EMP001"}'
```

### Frontend Testing
```bash
# Build verification
cd windsurf-frontend && npm run build

# Development server
npm run dev
```

### Database Testing
```bash
# Schema verification
mysql -u grievance_user -p grievance_portal \
  -e "DESCRIBE users; DESCRIBE issues; DESCRIBE issue_comments;"
```

## 📋 Data Migration

If migrating from an existing system:

1. **Export existing data** to CSV format
2. **Use bulk upload tools** in admin dashboard
3. **Run data validation** scripts
4. **Verify data integrity** after migration

See `windsurf-database/README.md` for detailed migration instructions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards and add tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL service
docker-compose logs mysql
# Verify credentials in .env files
```

**Frontend Build Errors**
```bash
# Clear node modules and reinstall
cd windsurf-frontend
rm -rf node_modules package-lock.json
npm install
```

**API Not Responding**
```bash
# Check backend service
docker-compose logs backend
# Verify environment variables
```

**Authentication Issues**
```bash
# Verify JWT secret configuration
# Check user credentials in database
# Review browser network tab for errors
```

### Support Resources

- **Health Endpoint**: `/api/health` for system status
- **Application Logs**: `docker-compose logs [service]`
- **Database Status**: Check MySQL connectivity
- **Environment Config**: Verify all `.env` files

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 Deployment Status

**✅ Production Ready** | **✅ Feature Complete** | **✅ Mobile Optimized** | **✅ Docker Ready**

**Current Version**: 1.0.0 | **Last Updated**: December 2024

This is a **complete, production-ready** grievance management system with full mobile and admin capabilities.
