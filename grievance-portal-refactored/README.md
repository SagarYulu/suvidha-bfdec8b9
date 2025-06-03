
# Grievance Portal - Refactored Architecture

This project has been refactored from a Supabase-based architecture to a traditional Node.js/Express backend with MySQL database.

## Project Structure

```
grievance-portal-refactored/
├── frontend/          # React application
├── backend/           # Node.js/Express API server
├── database/          # MySQL scripts and migrations
├── docker-compose.yml # Complete development environment
└── README.md          # This file
```

## Quick Start with Docker

1. **Clone and setup**:
   ```bash
   cd grievance-portal-refactored
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Start everything with Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Initialize database**:
   ```bash
   # Wait for MySQL to be ready, then run:
   docker-compose exec backend npm run migrate
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

## Manual Setup

### 1. MySQL Database Setup

#### Install MySQL
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install mysql-server

# macOS
brew install mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

#### Create Database
```bash
mysql -u root -p
CREATE DATABASE grievance_portal;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Run Schema
```bash
mysql -u grievance_user -p grievance_portal < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm start
```

## Data Migration from Supabase

See `database/data_migration.md` for detailed instructions on migrating your existing Supabase data to MySQL.

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=grievance_portal
DB_USER=grievance_user
DB_PASSWORD=grievance_password
JWT_SECRET=your-super-secret-jwt-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

The backend provides the following endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Issues**: `/api/issues` (CRUD operations)
- **Users**: `/api/users` (user management)
- **Analytics**: `/api/analytics` (dashboard data)

## Production Deployment

### Using Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set up MySQL on your production server
2. Deploy backend with PM2 or similar process manager
3. Build and serve frontend with nginx or similar web server

## Features Maintained

All existing functionality has been preserved:
- User authentication and authorization
- Issue/grievance CRUD operations
- Dashboard analytics
- File upload functionality
- Real-time updates
- Role-based access control

## Support

For issues or questions, please refer to the individual README files in each directory:
- `backend/README.md` - Backend API documentation
- `frontend/README.md` - Frontend setup and development
- `database/README.md` - Database schema and migration details
