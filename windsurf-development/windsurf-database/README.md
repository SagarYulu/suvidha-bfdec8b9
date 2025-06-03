
# Windsurf Database Migration

This directory contains database schema and migration scripts for the Grievance Portal Windsurf deployment.

## Files

- `windsurf-sql/schema.sql` - Complete MySQL schema for the application
- `windsurf-sql/data_migration.sql` - Data migration scripts
- `migrate_from_supabase.js` - Automated migration tool from Supabase to MySQL
- `.env.example` - Environment configuration template

## Setup Instructions

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE grievance_portal;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u grievance_user -p grievance_portal < windsurf-sql/schema.sql
```

### 2. Migration from Supabase

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and MySQL credentials

# Run migration
npm run migrate
```

### 3. Verify Migration

```bash
# Test database connection
npm run test-connection
```

## Migration Process

The migration script will:

1. Connect to your Supabase instance
2. Export all data from relevant tables
3. Transform data to match MySQL schema
4. Import data into MySQL database
5. Verify data integrity

## Troubleshooting

- Ensure MySQL server is running
- Check database credentials in .env file
- Verify Supabase access permissions
- Review migration logs for errors

## Manual Migration

If automated migration fails, use the SQL scripts in `windsurf-sql/` directory for manual data transfer.
