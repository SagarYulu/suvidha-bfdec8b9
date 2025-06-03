
# Data Export Instructions

This utility exports all your existing data from Supabase and generates MySQL-compatible SQL INSERT statements.

## Prerequisites

1. Node.js installed on your system
2. Access to your Supabase project
3. MySQL database set up and running

## Steps to Export Data

### 1. Install Dependencies
```bash
cd windsurf-database
npm install
```

### 2. Run the Export
```bash
npm run export
```

This will:
- Connect to your Supabase database
- Extract all data from all tables
- Generate `02_actual_data.sql` with MySQL-compatible INSERT statements
- Show export statistics

### 3. Import to MySQL

First, create the database and tables:
```bash
mysql -u root -p
CREATE DATABASE grievance_portal;
exit

mysql -u root -p grievance_portal < 01_schema.sql
```

Then import your actual data:
```bash
mysql -u root -p grievance_portal < 02_actual_data.sql
```

### 4. Verify the Import

Connect to MySQL and verify your data:
```bash
mysql -u root -p grievance_portal

-- Check record counts
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'dashboard_users', COUNT(*) FROM dashboard_users
UNION ALL  
SELECT 'issues', COUNT(*) FROM issues
UNION ALL
SELECT 'issue_comments', COUNT(*) FROM issue_comments;
```

## Exported Tables

The utility exports data from these tables in dependency order:

1. **Master Data**
   - master_cities
   - master_clusters
   - master_roles

2. **RBAC System**
   - rbac_roles
   - rbac_permissions
   - rbac_role_permissions

3. **Users**
   - employees
   - dashboard_users
   - rbac_user_roles

4. **Issues & Comments**
   - issues
   - issue_comments
   - issue_internal_comments
   - issue_audit_trail
   - issue_notifications

5. **Feedback & Audit**
   - ticket_feedback
   - dashboard_user_audit_logs
   - master_audit_logs

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and API key
- Check your internet connection
- Ensure Supabase project is accessible

### Data Type Issues
- The utility handles UUID, JSON, boolean, and timestamp conversions
- If you encounter specific data type errors, check the `escapeValue` function

### Large Datasets
- For large datasets, the export might take some time
- Monitor console output for progress
- The generated SQL file size is displayed at completion

### Import Errors
- Ensure you run the schema file (01_schema.sql) first
- Check that all foreign key dependencies are satisfied
- Verify MySQL user has proper permissions

## Post-Migration Steps

1. **Update Backend Configuration**
   - Update `.env` files to use MySQL connection
   - Test all API endpoints
   - Verify authentication works

2. **Test Application**
   - Login functionality
   - Create/read/update/delete operations
   - File uploads (if any)
   - Analytics and reporting

3. **Performance Optimization**
   - Add indexes for frequently queried columns
   - Optimize slow queries
   - Set up monitoring

## Security Notes

- The exported SQL file contains all your data
- Store it securely and delete after successful import
- Consider encrypting sensitive data
- Update passwords after migration

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify table structures match between Supabase and MySQL
3. Test with a subset of data first
4. Check MySQL error logs for detailed information
