
# Yulu Grievance Portal - Complete Local Deployment

## Overview
This is a complete grievance management system with separate frontend and backend applications designed for local deployment.

## Architecture
- **Frontend**: React application running on port 3000
- **Backend**: Express.js API server running on port 5000
- **Database**: MySQL database with imported schema

## Quick Start

### 1. Database Setup
1. Install MySQL and start the service
2. Create a new database: `CREATE DATABASE grievance_portal;`
3. Import the provided SQL schema file (generated from the export tool)
4. Verify all tables are created successfully

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The API will be available at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`

## Features

### ✅ Complete Grievance Management
- Issue creation and tracking
- Status management (open, in_progress, resolved, closed)
- Priority levels (low, medium, high, critical)
- Assignment to agents/admins

### ✅ User Management
- Admin dashboard access
- Employee mobile interface
- Role-based authentication
- JWT token management

### ✅ Feedback System
- Happy/sad/neutral sentiment
- Reason collection
- Analytics dashboard

### ✅ Analytics & Reporting
- Dashboard metrics
- Filter capabilities
- Chart visualizations
- Export functionality

### ✅ Communication
- Comment threads
- Internal admin comments
- Status notifications
- Audit trail

## Default Credentials

### Admin Access
- Email: admin@yulu.com
- Password: admin123

### Employee Access
- Employee ID: Any valid ID from the database
- Password: 123456

## Deployment Architecture

```
Frontend (Port 3000)
    ↓ API Calls
Backend (Port 5000)
    ↓ Database Queries
MySQL Database (Port 3306)
```

## Environment Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=grievance_portal
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Health Checks
- Backend API: `http://localhost:5000/health`
- Frontend: `http://localhost:3000`

## Production Deployment
1. Update environment variables for production
2. Build frontend: `npm run build`
3. Configure reverse proxy (nginx/apache)
4. Set up SSL certificates
5. Configure production database

This setup preserves all functionality from the original Lovable application while providing a clean separation between frontend and backend for local development and deployment.
