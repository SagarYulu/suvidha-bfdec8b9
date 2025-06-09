
# Grievance Portal - Windsurf Development

A complete grievance management system built with Express.js, MySQL, and React. This is a production-ready implementation with full MVC architecture, real-time features, and comprehensive admin dashboard.

## 🏗️ Architecture

- **Backend**: Express.js with MVC pattern
- **Database**: MySQL 8.0
- **Frontend**: React with TypeScript
- **Real-time**: WebSocket integration
- **Authentication**: JWT-based auth
- **File Storage**: AWS S3 integration
- **Email**: SMTP notifications
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0 (if running locally)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd windsurf-development
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your configuration:
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

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### 3. Start with Docker
```bash
docker-compose up -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔐 Default Credentials

**Admin Dashboard**:
- Email: `admin@yulu.com`
- Password: `admin123`

**Mobile App**: Use any employee email + employee ID

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
│   │   └── services/         # API services
├── windsurf-database/         # Database migrations
└── docker-compose.yml        # Docker configuration
```

## 🎯 Features

### Core Features
- ✅ Create & manage grievance tickets
- ✅ Real-time status updates
- ✅ Comment system with internal notes
- ✅ File attachments with S3 storage
- ✅ Email notifications
- ✅ Mobile-responsive design

### Advanced Features
- ✅ Auto-assignment based on location
- ✅ SLA monitoring & breach alerts
- ✅ Escalation workflows
- ✅ TAT analytics & reporting
- ✅ Role-based access control (RBAC)
- ✅ Audit trails
- ✅ Dashboard analytics

### Admin Features
- ✅ User management
- ✅ Issue analytics
- ✅ Performance metrics
- ✅ Workload distribution
- ✅ Feedback analysis

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/mobile-login` - Mobile login
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/refresh` - Refresh token

### Issues
- `GET /api/issues` - List issues
- `POST /api/issues` - Create issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/comments` - Add comment

### Analytics
- `GET /api/tat/metrics` - TAT metrics
- `GET /api/tat/trend` - Trend data
- `GET /api/tat/breaches` - SLA breaches
- `GET /api/tat/performance` - Team performance

### System
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed health

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
# Run migrations
mysql -u root -p < windsurf-database/migrations/001_initial_schema.sql
```

## 📊 Monitoring

### Health Checks
- Backend: `curl http://localhost:5000/api/health`
- Database connectivity, WebSocket status, memory usage

### Logs
- Application logs: `docker-compose logs backend`
- Database logs: `docker-compose logs mysql`

## 🚢 Production Deployment

### 1. Environment Setup
```bash
# Use production environment file
cp .env.example .env.production
# Configure production values
```

### 2. Build & Deploy
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### 3. SSL & Domain
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates
- Update CORS origins

## 🔐 Security

- JWT authentication with refresh tokens
- Input validation & sanitization
- SQL injection prevention
- XSS protection headers
- Rate limiting
- CORS configuration
- Environment-based secrets

## 📈 Performance

- MySQL connection pooling
- Response compression
- Static file caching
- Optimized queries with indexes
- WebSocket for real-time updates

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yulu.com","password":"admin123"}'
```

### WebSocket Testing
```javascript
const ws = new WebSocket('ws://localhost:5000/ws?userId=admin-001');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the health endpoint: `/api/health`
- Review application logs
- Check database connectivity
- Verify environment variables

---

**Production Ready** ✅ | **MVC Architecture** ✅ | **100% MySQL** ✅ | **Feature Complete** ✅
