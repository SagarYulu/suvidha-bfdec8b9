
# Database Documentation

This directory contains MySQL database schema and migration scripts for the Grievance Portal.

## Files

- `schema.sql` - Complete database schema with sample data
- `data_migration.md` - Detailed migration instructions from Supabase
- `scripts/` - Migration and utility scripts

## Quick Setup

1. **Create database**:
   ```bash
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'grievance_password';
   GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Run schema**:
   ```bash
   mysql -u grievance_user -p grievance_portal < schema.sql
   ```

## Database Schema Overview

### Core Tables

- **employees** - Employee master data
- **dashboard_users** - Dashboard/admin users
- **issues** - Grievance tickets
- **issue_comments** - Public comments on issues
- **issue_internal_comments** - Internal staff comments
- **issue_audit_trail** - Change history
- **issue_notifications** - User notifications
- **ticket_feedback** - User feedback on resolutions

### Master Data

- **master_cities** - City master
- **master_clusters** - Cluster/area master

### RBAC (Role-Based Access Control)

- **rbac_roles** - System roles
- **rbac_permissions** - System permissions
- **rbac_role_permissions** - Role-permission mapping
- **rbac_user_roles** - User-role assignments

### Audit Tables

- **dashboard_user_audit_logs** - User management audit
- **master_audit_logs** - Master data changes

## Key Features

- UUID primary keys for distributed systems
- Comprehensive indexing for performance
- Foreign key constraints for data integrity
- JSON support for flexible data storage
- Audit trails for compliance
- Role-based access control

## Data Migration

See `data_migration.md` for complete instructions on migrating from Supabase to MySQL.
