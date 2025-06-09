
# Windsurf Grievance Portal - Complete Production System

A complete, production-ready grievance management system built with **Express.js + MySQL** backend and **React + TypeScript** frontend. This is a 100% MySQL-native implementation with **zero Supabase dependencies**.

## 🚀 Features

### Core Functionality
- ✅ **Complete Issue Management** - Create, track, update, and resolve issues
- ✅ **Advanced Comment System** - Public and internal comments with real-time updates
- ✅ **Smart Assignment Flow** - Intelligent issue assignment with workload balancing
- ✅ **Comprehensive Status Tracking** - Full audit trail and timeline
- ✅ **Multi-role Authentication** - Admin, Manager, Agent, and Employee roles

### Advanced Features
- ✅ **TAT/SLA Management** - Automated tracking with buckets (≤14, 14–30, >30 days)
- ✅ **Escalation System** - Manual and automatic escalations with time thresholds
- ✅ **Feedback & Ratings** - Emoji-based feedback with analytics
- ✅ **File Upload System** - Cloud storage with S3 integration
- ✅ **Email Notifications** - SMTP-based notifications for all events
- ✅ **Real-time Updates** - WebSocket integration for live updates

### Infrastructure
- ✅ **Production-Ready Architecture** - Clean MVC structure
- ✅ **Complete Database Schema** - Optimized MySQL with proper indexing
- ✅ **Docker Deployment** - Full containerization support
- ✅ **Health Monitoring** - Comprehensive health checks and metrics
- ✅ **Background Jobs** - Cron-based automation for escalations and cleanup
- ✅ **API Documentation** - RESTful APIs with proper error handling

## 🏗️ Architecture

### Backend (Express.js + MySQL)
```
windsurf-backend/
├── controllers/     # Request/response handlers
├── models/         # Database operations
├── services/       # Business logic layer
├── routes/         # API route definitions
├── middleware/     # Auth, validation, error handling
├── config/         # Database and environment config
└── utils/          # Helper functions
```

### Frontend (React + TypeScript)
```
windsurf-frontend/
├── components/     # Reusable UI components
├── pages/         # Route-based page components
├── hooks/         # Custom React hooks
├── services/      # API communication
├── contexts/      # React contexts for state
└── utils/         # Helper utilities
```

### Database (MySQL)
```
windsurf-database/
├── schema.sql           # Complete database schema
└── migrations/          # Database migrations
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MySQL 8.0+
- Docker and Docker Compose (optional)

### 1. Environment Setup
```bash
# Clone and setup
git clone <repository>
cd windsurf-development

# Install dependencies
npm run setup

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE grievance_portal;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';

# Run migrations
cd windsurf-backend
npm run migrate
```

### 3. Start Development
```bash
# Start both backend and frontend
npm run dev

# Or start separately
npm run dev:backend  # Backend on :5000
npm run dev:frontend # Frontend on :3000
```

### 4. Docker Deployment
```bash
# Development environment
docker-compose up --build

# Production environment
docker-compose -f docker-compose.prod.yml up --build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin/Agent login
- `POST /api/auth/mobile-login` - Employee login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Issues Management
- `GET /api/issues` - List issues with filters
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/assign` - Assign issue
- `POST /api/issues/:id/comments` - Add comment

### Feedback System
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/issue/:id` - Get issue feedback
- `GET /api/feedback/stats/summary` - Feedback analytics

### Escalations
- `POST /api/escalations` - Create escalation
- `GET /api/escalations/issue/:id` - Get issue escalations
- `GET /api/escalations/status/pending` - Pending escalations

### File Management
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload/multiple` - Upload multiple files
- `GET /api/files/signed-url/:key` - Get file access URL

### Real-time Updates
- `GET /api/realtime/stats` - WebSocket statistics
- `POST /api/realtime/notify/user` - Send user notification
- `POST /api/realtime/broadcast/role` - Broadcast to role

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```bash
# Database
DB_HOST=localhost
DB_USER=grievance_user
DB_PASSWORD=grievance_password
DB_NAME=grievance_portal

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage (S3 or Local)
AWS_ACCESS_KEY_ID=your-key
S3_BUCKET_NAME=your-bucket

# TAT Configuration
TAT_WARNING_HOURS=168    # 7 days
TAT_CRITICAL_HOURS=336   # 14 days
TAT_BREACH_HOURS=720     # 30 days
```

### Features Toggle
Enable/disable features via environment:
```bash
EMAIL_NOTIFICATIONS=true
REALTIME_NOTIFICATIONS=true
WEBSOCKET_ENABLED=true
BACKUP_ENABLED=true
```

## 🎯 Key Components

### Backend Services
- **TATService** - TAT monitoring and SLA management
- **EscalationService** - Automatic and manual escalations
- **EmailService** - SMTP-based email notifications
- **WebSocketService** - Real-time communication
- **CronService** - Background job processing
- **FileUploadService** - S3/Local file management

### Frontend Components
- **CloudFileUpload** - Advanced file upload with progress
- **StatusTimeline** - Visual issue timeline
- **AssignmentFlow** - Intelligent assignment interface
- **FeedbackWidget** - Emoji-based feedback system
- **EscalationPanel** - Escalation management UI

### Custom Hooks
- **useRealtime** - WebSocket integration
- **useFeedback** - Feedback management
- **useFileUpload** - File upload handling
- **useIssueRealtime** - Issue-specific real-time updates

## 📈 Monitoring & Analytics

### Health Checks
- `GET /health` - Basic health status
- `GET /health/detailed` - Comprehensive health metrics

### Analytics Endpoints
- Issue trends and statistics
- TAT performance metrics
- Feedback analytics
- Escalation reporting
- User activity tracking

### Background Jobs
- TAT violation monitoring (hourly)
- Auto-escalation processing (6-hourly)
- Notification cleanup (daily)
- Health monitoring (5-minute intervals)

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Rate limiting** for API protection
- **Input validation** and sanitization
- **Helmet.js** security headers
- **CORS** configuration
- **SQL injection** prevention

## 🚀 Deployment

### Production Checklist
- [ ] Update `.env` with production values
- [ ] Configure SMTP for email notifications
- [ ] Setup S3 bucket for file storage
- [ ] Configure MySQL with proper users
- [ ] Setup SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with environment overrides
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl -f http://localhost/health
```

## 📚 Documentation

### API Documentation
Complete API documentation is available at `/api/docs` when running in development mode.

### Database Schema
The complete database schema with relationships is documented in `windsurf-database/schema.sql`.

### Component Library
Frontend components are documented with TypeScript interfaces and JSDoc comments.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the health check endpoints for debugging

---

**Built with ❤️ by the Windsurf Development Team**

*A complete, production-ready grievance management system that scales with your organization.*
