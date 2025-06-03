
# Grievance Portal - Windsurf Ready

Complete refactored Grievance Portal with separate backend, frontend, and database components ready for Windsurf deployment.

## Project Structure

```
├── windsurf-backend/          # Node.js/Express API server
├── windsurf-frontend/         # React frontend application  
├── windsurf-database/         # MySQL database schema and scripts
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
cd windsurf-database

# Start MySQL with Docker (recommended)
docker-compose up -d

# Or manual setup
mysql -u root -p
CREATE DATABASE grievance_portal;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;

# Run schema
mysql -u grievance_user -p grievance_portal < 01_schema.sql
mysql -u grievance_user -p grievance_portal < 02_sample_data.sql
```

### 2. Backend Setup

```bash
cd windsurf-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd windsurf-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## Default Login Credentials

### Admin Dashboard
- **Email:** admin@yulu.com
- **Password:** password

### Employee App
- **Employee ID:** EMP001
- **Password:** EMP001

## Features

### Backend (Node.js/Express)
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ MySQL integration
- ✅ File upload support
- ✅ Rate limiting & security
- ✅ Comprehensive error handling
- ✅ MVC architecture (routes/controllers/services)

### Frontend (React/TypeScript)
- ✅ Modern React with TypeScript
- ✅ Tailwind CSS styling
- ✅ React Query for data fetching
- ✅ React Router for navigation
- ✅ Form handling with validation
- ✅ Responsive design
- ✅ Authentication context

### Database (MySQL)
- ✅ Complete schema migration from Supabase
- ✅ Optimized indexes and relationships
- ✅ RBAC implementation
- ✅ Audit logging
- ✅ Sample data included

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/verify` - Verify token

### Issues
- `GET /api/issues` - List issues with filters
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PATCH /api/issues/:id/status` - Update status
- `POST /api/issues/:id/comments` - Add comment

### Users & Analytics
- `GET /api/users` - List users
- `GET /api/analytics/dashboard` - Dashboard metrics

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=grievance_user
DB_PASSWORD=grievance_password
DB_NAME=grievance_portal
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

### Docker Deployment

```bash
# Backend
cd windsurf-backend
docker build -t grievance-backend .
docker run -p 5000:5000 grievance-backend

# Frontend  
cd windsurf-frontend
docker build -t grievance-frontend .
docker run -p 80:80 grievance-frontend

# Database
cd windsurf-database
docker-compose up -d
```

### Production Deployment

1. **Database:** Set up MySQL 8.0+ server
2. **Backend:** Deploy to Node.js hosting (PM2 recommended)
3. **Frontend:** Build and deploy to static hosting/CDN

## Migration from Supabase

If migrating existing data:

1. Export data from Supabase dashboard
2. Use `windsurf-database/03_migrate_from_supabase.sql`
3. Follow migration guide in `windsurf-database/README.md`

## Development

### Adding New Features

1. **Backend:** Add routes → controllers → services
2. **Frontend:** Add pages → components → services  
3. **Database:** Create migration scripts

### Code Structure

- **Backend:** MVC pattern with clear separation
- **Frontend:** Component-based with hooks
- **Database:** Normalized schema with proper indexes

## Support

- Check individual README files in each folder
- Review `.env.example` files for configuration
- Database setup guide in `windsurf-database/README.md`

## License

MIT License - see individual component licenses.
