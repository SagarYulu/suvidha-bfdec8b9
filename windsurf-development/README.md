
# Grievance Portal - Windsurf Development Version

A complete grievance management system refactored for Windsurf deployment with React frontend, Node.js/Express backend, and MySQL database.

## Project Structure

```
windsurf-development/
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
- **Access to your original Supabase project** (for data migration)

## 🚀 Quick Start Guide

### Option 1: Quick Setup with Docker (Recommended)

1. **Clone and setup environment:**
   ```bash
   cd windsurf-development
   cp windsurf-backend/.env.example windsurf-backend/.env
   cp windsurf-frontend/.env.example windsurf-frontend/.env
   cp windsurf-database/.env.example windsurf-database/.env
   ```

2. **Configure your environment variables:**
   ```bash
   # Edit windsurf-backend/.env
   DB_HOST=mysql
   DB_USER=grievance_user
   DB_PASSWORD=grievance_password
   DB_NAME=grievance_portal
   JWT_SECRET=your-super-secret-jwt-key
   
   # Edit windsurf-frontend/.env
   VITE_API_URL=http://localhost:5000
   
   # Edit windsurf-database/.env (for migration)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   MYSQL_HOST=localhost
   MYSQL_USER=grievance_user
   MYSQL_PASSWORD=grievance_password
   MYSQL_DATABASE=grievance_portal
   ```

3. **Start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Migrate your data from Supabase (IMPORTANT!):**
   ```bash
   # In a new terminal, navigate to database directory
   cd windsurf-database
   npm install
   
   # Run the migration to transfer your real data
   npm run migrate
   ```

5. **Access your application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

### Option 2: Manual Setup

#### Step 1: Database Setup

1. **Create MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
   GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Create database schema:**
   ```bash
   mysql -u grievance_user -p grievance_portal < windsurf-database/windsurf-sql/schema.sql
   ```

#### Step 2: Backend Setup

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

#### Step 3: Frontend Setup

1. **Install dependencies:**
   ```bash
   cd windsurf-frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Set VITE_API_URL to your backend URL
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

#### Step 4: Migrate Your Real Data

1. **Setup migration environment:**
   ```bash
   cd windsurf-database
   npm install
   cp .env.example .env
   ```

2. **Configure migration settings:**
   ```bash
   # Edit .env file with your credentials
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   MYSQL_HOST=localhost
   MYSQL_USER=grievance_user
   MYSQL_PASSWORD=grievance_password
   MYSQL_DATABASE=grievance_portal
   ```

3. **Run migration:**
   ```bash
   # Test connections first
   npm run test-connections
   
   # Run full migration
   npm run migrate
   
   # Verify migration success
   npm run verify
   ```

## 📊 Data Migration Details

### What Gets Migrated

The migration transfers all your real data from Supabase to MySQL:

- **employees** → **users** table
- **dashboard_users** → **dashboard_users** table  
- **issues** → **issues** table
- **issue_comments** → **issue_comments** table
- **ticket_feedback** → **feedback** table
- **All related master data and audit logs**

### Migration Features

- ✅ **Automatic data transformation** (UUID formats, timestamps, JSON)
- ✅ **Batch processing** for large datasets
- ✅ **Error handling** with detailed logging
- ✅ **Verification** to ensure data integrity
- ✅ **Resume capability** if migration is interrupted

### Troubleshooting Migration

If migration fails:

1. **Check logs:** Migration creates detailed logs in `windsurf-database/logs/`
2. **Verify credentials:** Ensure Supabase and MySQL access is correct
3. **Check connectivity:** Both databases must be accessible
4. **Review data:** Some records might need manual cleanup in source

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost          # MySQL host
DB_PORT=3306              # MySQL port
DB_USER=grievance_user    # MySQL username
DB_PASSWORD=grievance_password  # MySQL password
DB_NAME=grievance_portal  # Database name
JWT_SECRET=your-jwt-secret
PORT=5000                 # Server port
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000  # Backend API URL
```

### Database Migration (.env)
```env
# Source (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Destination (MySQL)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=grievance_user
MYSQL_PASSWORD=grievance_password
MYSQL_DATABASE=grievance_portal

# Migration Settings
BATCH_SIZE=1000
LOG_LEVEL=info
```

## API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth/*`)
- Issues/Grievances (`/api/issues/*`)
- Users (`/api/users/*`)
- Analytics (`/api/analytics/*`)
- Dashboard (`/api/dashboard/*`)
- Feedback (`/api/feedback/*`)
- Notifications (`/api/notifications/*`)

## Development

- Backend runs on port 5000 with hot reload
- Frontend runs on port 3000 with hot reload
- MySQL runs on port 3306

## Production Deployment

### Build for Production

1. **Build frontend:**
   ```bash
   cd windsurf-frontend
   npm run build
   ```

2. **Deploy with Docker:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

## ⚠️ Important Notes

1. **Data Migration is Required**: This project starts with empty MySQL tables. You MUST run the migration to get your real data.

2. **Complete Separation**: This is independent of your original Lovable/Supabase project.

3. **Production Ready**: Optimized for deployment on Windsurf servers.

4. **No Supabase Dependencies**: Uses MySQL exclusively for data storage.

## Support

For issues:
1. Check migration logs in `windsurf-database/logs/`
2. Verify environment configuration
3. Ensure database permissions
4. Review console output for errors

## 🎯 Next Steps After Setup

1. **Run data migration** to get your real data
2. **Test all functionality** with your actual data
3. **Configure production environment** variables
4. **Deploy to your Windsurf server**

---

**Note:** This project replaces Supabase with MySQL and is ready for independent deployment in Windsurf environment.
