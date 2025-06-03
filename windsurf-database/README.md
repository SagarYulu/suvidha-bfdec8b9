
# Grievance Portal Database Setup

This directory contains the MySQL database schema and migration scripts for the Grievance Portal application.

## Files Overview

- `01_schema.sql` - Complete MySQL database schema (authoritative)
- `02_sample_data.sql` - Sample data for testing (optional)
- `03_migrate_from_supabase.sql` - Migration scripts from Supabase to MySQL

## Database Schema

### Core Tables

1. **employees** - Main user table for employees
2. **dashboard_users** - Admin interface users
3. **issues** - Main grievance/issue tracking
4. **issue_comments** - Public comments on issues
5. **issue_internal_comments** - Internal admin comments
6. **issue_audit_trail** - Complete audit trail for issues
7. **issue_notifications** - User notifications
8. **ticket_feedback** - User feedback and ratings
9. **user_sessions** - JWT session management

### Master Data Tables

10. **master_cities** - City master data
11. **master_clusters** - Cluster/zone master data
12. **master_issue_types** - Issue type definitions
13. **master_issue_sub_types** - Issue sub-type definitions

### RBAC Tables

14. **rbac_roles** - Role definitions
15. **rbac_permissions** - Permission definitions
16. **rbac_role_permissions** - Role-permission mappings
17. **rbac_user_roles** - User-role assignments

### Audit Tables

18. **user_audit_logs** - User activity audit
19. **system_audit_logs** - System-level audit logs

## Setup Instructions

### 1. Prerequisites

- MySQL 8.0 or higher
- Database user with CREATE, ALTER, INSERT, UPDATE, DELETE privileges

### 2. Database Creation

```bash
# Connect to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Schema Installation

```bash
# Import the schema
mysql -u grievance_user -p grievance_portal < 01_schema.sql
```

### 4. Verify Installation

```sql
USE grievance_portal;
SHOW TABLES;
-- Should show 19 tables

-- Check sample data
SELECT COUNT(*) FROM master_cities;
SELECT COUNT(*) FROM master_issue_types;
SELECT COUNT(*) FROM rbac_roles;
```

## Environment Configuration

Update your `.env` file in the backend:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=grievance_user
DB_PASSWORD=your_secure_password
DB_NAME=grievance_portal
DB_CONNECTION_LIMIT=10
```

## Default Credentials

### Admin User
- **Email**: admin@grievance.local
- **Password**: admin123 (Please change immediately)
- **Role**: admin

## Database Features

### Performance Optimizations
- Indexed primary and foreign keys
- Composite indexes for common query patterns
- Proper data types for optimal storage
- Connection pooling support

### Security Features
- Foreign key constraints for data integrity
- ENUM types for controlled values
- Password hashing support
- Session management for JWT tokens

### Audit Trail
- Complete audit logging for user actions
- System-level change tracking
- IP address and user agent logging

### Scalability
- UUID primary keys for distributed systems
- JSON columns for flexible data storage
- Proper normalization for query efficiency

## Migration from Supabase

If migrating from Supabase, use the migration scripts:

1. Export data from Supabase (see `03_migrate_from_supabase.sql`)
2. Transform data format for MySQL
3. Import using provided scripts

## Maintenance

### Regular Tasks
- Monitor table sizes and performance
- Archive old audit logs periodically
- Update statistics for query optimization
- Backup database regularly

### Monitoring Queries

```sql
-- Check database size
SELECT 
    table_schema as 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'grievance_portal';

-- Check table row counts
SELECT 
    table_name,
    table_rows
FROM information_schema.tables 
WHERE table_schema = 'grievance_portal'
ORDER BY table_rows DESC;
```

## Support

For database-related issues:
1. Check MySQL error logs
2. Verify connection parameters
3. Ensure proper permissions
4. Review foreign key constraints

## Version History

- **v1.0** - Initial schema with complete feature set
- Supports windsurf-backend architecture
- Compatible with MySQL 8.0+
- Performance optimized with proper indexing
