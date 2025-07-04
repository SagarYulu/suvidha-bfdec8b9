# Production Deployment Guide

## 🚀 Server Requirements

**Minimum Requirements:**
- Node.js 20.x or higher
- PostgreSQL 14+ database
- 2GB RAM minimum
- 10GB storage space

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create `.env` file on your production server:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/yulu_issues
PGHOST=localhost
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=yulu_issues

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here

# Session Security (generate random strings)
SESSION_SECRET=your-session-secret-key-here
```

### 2. Database Setup

**Option A: New Database (Recommended)**
```bash
# Create database
sudo -u postgres createdb yulu_issues
sudo -u postgres createuser yulu_user --pwprompt

# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE yulu_issues TO yulu_user;
```

**Option B: Existing Database**
```bash
# Backup existing data first!
pg_dump existing_db > backup.sql
```

### 3. Install Dependencies
```bash
npm install --production
```

## 🗄️ Database Migration Options

### Option 1: Fresh Installation (New Server)
```bash
# Push schema to database
npm run db:push

# Seed with master data
node -e "import('./server/seedOriginalData.js').then(m => m.seedOriginalSupabaseData())"
```

### Option 2: Migration from Existing System
```bash
# Generate migration files first
npx drizzle-kit generate:pg

# Review migration files in ./migrations/
# Then apply migrations
npx drizzle-kit push:pg
```

## 🔄 Step-by-Step Deployment

### 1. Server Setup
```bash
# Clone/upload your code
git clone your-repo.git
cd your-project

# Install dependencies
npm install --production

# Set environment variables
cp .env.example .env
# Edit .env with your production values
```

### 2. Database Migration
```bash
# Test database connection
node -e "console.log(process.env.DATABASE_URL)"

# Push schema (creates all tables)
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### 3. Data Migration
```bash
# Import your existing data
# If coming from another system, prepare CSV files first

# Seed master data (roles, cities, clusters)
node server/seedOriginalData.js
```

### 4. Build Application
```bash
# Build frontend and backend
npm run build

# Test production build
npm start
```

### 5. Process Management (PM2 Recommended)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yulu-issues',
    script: './dist/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time features
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🛠️ Migration Scripts

### Data Export (if migrating from existing system)
```sql
-- Export employees
COPY (SELECT * FROM employees) TO '/tmp/employees.csv' CSV HEADER;

-- Export issues
COPY (SELECT * FROM issues) TO '/tmp/issues.csv' CSV HEADER;

-- Export comments
COPY (SELECT * FROM issue_comments) TO '/tmp/comments.csv' CSV HEADER;
```

### Data Import
```sql
-- Import to new system
COPY employees FROM '/tmp/employees.csv' CSV HEADER;
COPY issues FROM '/tmp/issues.csv' CSV HEADER;
COPY issue_comments FROM '/tmp/comments.csv' CSV HEADER;
```

## ✅ Post-Deployment Verification

### 1. Health Checks
```bash
# Check application status
curl http://localhost:5000/api/health || echo "Add health endpoint"

# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM employees;"

# Verify WebSocket
wscat -c ws://localhost:5000/ws
```

### 2. Test Core Features
- [ ] Admin login works
- [ ] Employee login works  
- [ ] Issue creation works
- [ ] Comments system works
- [ ] Real-time chat works
- [ ] File uploads work
- [ ] Reports generate correctly

## 🔐 Security Checklist

- [ ] Environment variables are secure
- [ ] Database has proper user permissions
- [ ] JWT secrets are random and strong
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured
- [ ] Regular database backups scheduled

## 📊 Monitoring Setup

```bash
# Add health check endpoint in server/routes.ts
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

## 🚨 Troubleshooting

**Database Connection Issues:**
```bash
# Test database connectivity
pg_isready -h localhost -p 5432

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**Application Issues:**
```bash
# Check application logs
pm2 logs yulu-issues

# Check system resources
htop
df -h
```

**WebSocket Issues:**
```bash
# Check if WebSocket port is open
netstat -tlnp | grep :5000

# Test WebSocket connection
wscat -c ws://localhost:5000/ws
```