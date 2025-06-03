
# Database Migration Guide

This directory contains scripts and utilities for migrating data from Supabase to MySQL.

## Prerequisites

1. Node.js 18+ installed
2. MySQL 8.0+ server running
3. Access to your Supabase project
4. Supabase project URL and API keys

## Setup

1. **Install dependencies:**
   ```bash
   cd windsurf-database
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and MySQL credentials
   ```

3. **Create MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
   GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Run schema creation:**
   ```bash
   mysql -u grievance_user -p grievance_portal < windsurf-sql/schema.sql
   ```

## Migration Process

### Option 1: Automated Migration (Recommended)

Run the automated migration script:

```bash
npm run migrate
```

This script will:
- Connect to your Supabase project
- Export all data from relevant tables
- Transform the data for MySQL compatibility
- Import the data into your MySQL database
- Verify the migration results

### Option 2: Manual Migration

1. **Export data from Supabase:**
   - Go to your Supabase dashboard
   - Navigate to the SQL editor
   - Run export queries for each table
   - Download the results as CSV or JSON

2. **Convert and import data:**
   - Use the provided `data_migration.sql` template
   - Replace placeholder queries with your actual data
   - Run the script: `mysql -u grievance_user -p grievance_portal < windsurf-sql/data_migration.sql`

## Verification

After migration, verify your data:

```bash
mysql -u grievance_user -p grievance_portal
```

```sql
-- Check table counts
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'grievance_portal';

-- Verify specific data
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM issues;
SELECT COUNT(*) FROM dashboard_users;
SELECT COUNT(*) FROM ticket_feedback;
```

## Troubleshooting

### Common Issues:

1. **Connection Issues:**
   - Verify MySQL server is running
   - Check credentials in `.env` file
   - Ensure firewall allows MySQL connections

2. **Data Type Mismatches:**
   - UUIDs: Supabase uses `uuid`, MySQL uses `VARCHAR(36)`
   - Timestamps: May need format conversion
   - JSON: Ensure MySQL 5.7+ for JSON support

3. **Foreign Key Constraints:**
   - Data must be imported in correct order
   - Parent records must exist before children
   - Use `SET FOREIGN_KEY_CHECKS = 0;` if needed

### Manual Data Export from Supabase:

```sql
-- Export employees
SELECT * FROM employees ORDER BY created_at;

-- Export dashboard_users
SELECT * FROM dashboard_users ORDER BY created_at;

-- Export issues
SELECT * FROM issues ORDER BY created_at;

-- Export ticket_feedback
SELECT * FROM ticket_feedback ORDER BY created_at;
```

## Schema Differences

Key differences between Supabase and MySQL schemas:

| Aspect | Supabase | MySQL |
|--------|----------|-------|
| Primary Keys | UUID (auto-generated) | VARCHAR(36) with UUID() |
| Timestamps | timestamptz | TIMESTAMP |
| JSON | jsonb | JSON |
| Arrays | ARRAY type | JSON or separate table |
| Case Sensitivity | Case-sensitive | Depends on settings |

## Post-Migration Steps

1. **Update application configuration:**
   - Change database connection strings
   - Update any hardcoded Supabase references
   - Test all CRUD operations

2. **Performance optimization:**
   - Analyze query performance
   - Add indexes as needed
   - Configure MySQL settings for your workload

3. **Backup strategy:**
   - Set up regular MySQL backups
   - Document recovery procedures
   - Test backup restoration

## Support

For migration issues:
1. Check the console output for error messages
2. Verify your `.env` configuration
3. Ensure all prerequisites are met
4. Check MySQL error logs: `/var/log/mysql/error.log`
