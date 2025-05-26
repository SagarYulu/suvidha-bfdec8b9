
# Yulu Grievance Portal - Complete Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Step 1: Database Setup

### 1.1 Install MySQL
- Download and install MySQL from https://dev.mysql.com/downloads/
- Start MySQL service
- Login to MySQL as root: `mysql -u root -p`

### 1.2 Create Database and User
```sql
-- Create database
CREATE DATABASE grievance_portal;

-- Create a user for the application (optional but recommended)
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE grievance_portal;
```

### 1.3 Run Schema Creation
Execute the SQL files in order:
```bash
mysql -u root -p grievance_portal < database/01_schema.sql
mysql -u root -p grievance_portal < database/02_sample_data.sql
```

## Step 2: Backend Setup

### 2.1 Navigate to backend directory
```bash
cd standalone-app/backend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Configure environment
Copy `.env.example` to `.env` and update database credentials:
```bash
cp .env.example .env
```

### 2.4 Start backend server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on http://localhost:5000

## Step 3: Frontend Setup

### 3.1 Navigate to frontend directory
```bash
cd ../frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start frontend development server
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Step 4: Access the Application

### Admin Dashboard
- URL: http://localhost:3000/admin/login
- Default credentials:
  - Email: admin@yulu.com
  - Password: password

### Mobile Employee Portal
- URL: http://localhost:3000/mobile/login
- Use any employee credentials from the sample data

## Features Included
- ✅ Employee Authentication
- ✅ Admin Authentication
- ✅ Issue Creation & Management
- ✅ Issue Assignment
- ✅ Comments System
- ✅ Internal Comments
- ✅ Issue Mapping
- ✅ Status Management
- ✅ Priority Management
- ✅ Feedback System
- ✅ Analytics Dashboard
- ✅ Sentiment Analysis
- ✅ Bulk User Upload
- ✅ Data Export
- ✅ RBAC (Role-Based Access Control)
- ✅ Mobile Responsive Design
- ✅ Real-time Updates
