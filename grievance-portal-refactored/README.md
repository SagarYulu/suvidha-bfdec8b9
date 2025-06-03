
# Grievance Portal - Refactored Architecture

A complete grievance management system with React frontend, Node.js/Express backend, and MySQL database.

## Project Structure

```
grievance-portal-refactored/
├── windsurf-frontend/     # React application
├── windsurf-backend/      # Node.js/Express API server
├── windsurf-database/     # Database scripts and utilities
│   └── windsurf-sql/      # SQL scripts for schema and migration
├── docker-compose.yml     # Multi-container setup
└── README.md             # This file
```

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Docker and Docker Compose (optional)

## Quick Start with Docker

1. **Clone and setup:**
   ```bash
   cd grievance-portal-refactored
   cp windsurf-backend/.env.example windsurf-backend/.env
   cp windsurf-frontend/.env.example windsurf-frontend/.env
   ```

2. **Configure environment variables in windsurf-backend/.env and windsurf-frontend/.env**

3. **Start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

## Manual Setup

### 1. Database Setup

1. **Create MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   ```

2. **Run schema creation:**
   ```bash
   mysql -u root -p grievance_portal < windsurf-database/windsurf-sql/schema.sql
   ```

3. **Run data migration (if migrating from Supabase):**
   ```bash
   cd windsurf-database
   npm install
   node migrate_from_supabase.js
   ```

### 2. Backend Setup

1. **Install dependencies:**
   ```bash
   cd windsurf-backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Install dependencies:**
   ```bash
   cd windsurf-frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Set REACT_APP_API_URL to your backend URL
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

## Environment Variables

### Backend (.env)
- `DB_HOST`: MySQL host (default: localhost)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: grievance_portal)
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 5000)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

## API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth/*`)
- Issues/Grievances (`/api/issues/*`)
- Users (`/api/users/*`)
- Analytics (`/api/analytics/*`)
- Feedback (`/api/feedback/*`)

## Development

- Backend runs on port 5000 with hot reload
- Frontend runs on port 3000 with hot reload
- MySQL runs on port 3306

## Deployment

### Production Build

1. **Build frontend:**
   ```bash
   cd windsurf-frontend
   npm run build
   ```

2. **Build backend Docker image:**
   ```bash
   cd windsurf-backend
   docker build -t grievance-portal-backend .
   ```

### Using Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Migration from Supabase

See `windsurf-database/README.md` for detailed migration instructions.

## Support

For issues and questions, please refer to the documentation in each component directory.
