
# Grievance Portal Database

MySQL database schema and migration scripts for the Grievance Portal.

## Files

- `01_schema.sql` - Complete database schema creation
- `02_sample_data.sql` - Sample data for testing
- `03_migrate_from_supabase.sql` - Migration script from Supabase

## Setup Instructions

### 1. Install MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (with Homebrew)
brew install mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database and User

```sql
-- Login as root
mysql -u root -p

-- Create database
CREATE DATABASE grievance_portal;

-- Create user
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 3. Run Schema Creation

```bash
# Create tables and structure
mysql -u grievance_user -p grievance_portal < 01_schema.sql

# Insert sample data (optional)
mysql -u grievance_user -p grievance_portal < 02_sample_data.sql
```

### 4. Migrate from Supabase (if applicable)

#### Export from Supabase

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Export each table:
   ```sql
   \copy employees TO 'employees.csv' WITH CSV HEADER;
   \copy dashboard_users TO 'dashboard_users.csv' WITH CSV HEADER;
   \copy issues TO 'issues.csv' WITH CSV HEADER;
   -- Repeat for all tables
   ```

#### Import to MySQL

```bash
# Place CSV files in appropriate directory
# Update file paths in 03_migrate_from_supabase.sql
mysql -u grievance_user -p grievance_portal < 03_migrate_from_supabase.sql
```

### 5. Verify Installation

```sql
-- Login to MySQL
mysql -u grievance_user -p grievance_portal

-- Check tables
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM dashboard_users;
SELECT COUNT(*) FROM issues;

-- Exit
EXIT;
```

## Database Configuration

Update your backend `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=grievance_portal
DB_USER=grievance_user
DB_PASSWORD=grievance_password
```

## Backup and Restore

### Create Backup
```bash
mysqldump -u grievance_user -p grievance_portal > grievance_portal_backup.sql
```

### Restore from Backup
```bash
mysql -u grievance_user -p grievance_portal < grievance_portal_backup.sql
```

## Performance Tuning

The schema includes optimized indexes for:
- Employee lookups by ID and email
- Issue filtering by status, priority, and dates
- User authentication queries
- Analytics aggregations

## Security Notes

- Change default passwords in production
- Use SSL connections for remote databases
- Implement proper backup strategies
- Monitor database access logs
- Regular security updates

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```sql
   GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Character Set Issues**
   ```sql
   ALTER DATABASE grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Large File Imports**
   ```sql
   SET GLOBAL local_infile = 1;
   SET GLOBAL max_allowed_packet = 1073741824;
   ```

For additional support, check the main project README.md.
