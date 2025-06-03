
# Grievance Portal Database Setup & Migration

This directory contains the MySQL database schema and migration scripts for the Grievance Portal application, including automated tools for migrating from Supabase (PostgreSQL) to MySQL.

## Files Overview

- `01_schema.sql` - Complete MySQL database schema (authoritative)
- `migrate_from_supabase.js` - Automated migration script from Supabase to MySQL
- `pre_migration_check.js` - Pre-migration validation and readiness check
- `verify_migration.js` - Post-migration verification script
- `test_connection.js` - Database connection testing utility
- `.env.migration.example` - Environment configuration template

## Quick Start

### 1. For New Installations (MySQL Only)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.migration.example .env
# Edit .env with your MySQL credentials

# Create database and install schema
mysql -u root -p
CREATE DATABASE grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
exit

# Install schema
npm run install-schema

# Test connection
npm test
```

### 2. For Supabase to MySQL Migration

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.migration.example .env
# Edit .env with both Supabase and MySQL credentials

# Run pre-migration checks
npm run pre-check

# Install MySQL schema first
npm run install-schema

# Run the migration
npm run migrate

# Verify migration success
npm run verify
```

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

## Migration Process

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ running and accessible
- Supabase project credentials (for migration)
- Sufficient disk space (check with pre-migration script)

### Step-by-Step Migration

#### 1. Environment Setup

```bash
# Copy and configure environment
cp .env.migration.example .env
```

Edit `.env` with your credentials:

```env
# Supabase (Source)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# MySQL (Target)
DB_HOST=localhost
DB_PORT=3306
DB_USER=grievance_user
DB_PASSWORD=your-mysql-password
DB_NAME=grievance_portal
```

#### 2. Pre-Migration Validation

```bash
npm run pre-check
```

This script validates:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ MySQL connection works
- ✅ MySQL schema is installed
- ✅ Disk space is sufficient
- ⚠️ Existing data conflicts
- 📊 Data size estimates

#### 3. Schema Installation

```bash
# Create MySQL database first
mysql -u root -p
CREATE DATABASE grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;

# Install the schema
npm run install-schema
```

#### 4. Run Migration

```bash
npm run migrate
```

The migration script will:
- 🔄 Export all data from Supabase tables
- 🔧 Transform data types (PostgreSQL → MySQL)
- 📥 Import data to MySQL tables
- 📊 Generate detailed progress reports
- 💾 Save migration logs

#### 5. Verify Migration

```bash
npm run verify
```

Verification includes:
- 📊 Record count comparison
- 🔍 Data integrity checks
- 🔗 Foreign key validation
- 🔧 Data type verification

## Migration Features

### Automated Data Transformation

- **Boolean Values**: `true/false` → `1/0`
- **JSON Fields**: Preserved and validated
- **Enum Values**: Validated against MySQL schema
- **UUID Fields**: Preserved and validated
- **Timestamps**: Converted to MySQL format

### Error Handling

- **Batch Processing**: Large tables processed in batches
- **Error Recovery**: Individual row failures don't stop migration
- **Detailed Logging**: Complete audit trail saved to files
- **Rollback Safety**: Foreign key constraints handled properly

### Data Validation

- **Referential Integrity**: Foreign key relationships verified
- **Data Types**: All field types validated post-migration
- **Required Fields**: NULL value checks for critical fields
- **Custom Validations**: Business rule validations

## Environment Configuration

### Required Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
DB_PASSWORD=your-mysql-password
```

### Optional Variables (with defaults)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=grievance_user
DB_NAME=grievance_portal
MIGRATION_BATCH_SIZE=100
```

## Troubleshooting

### Common Issues

#### 1. Connection Errors

```bash
# Test individual connections
node -e "const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY); client.from('employees').select('count', {count:'exact',head:true}).then(r => console.log('Supabase:', r))"

mysql -u grievance_user -p grievance_portal -e "SELECT 1"
```

#### 2. Schema Issues

```bash
# Reinstall schema
mysql -u grievance_user -p grievance_portal < 01_schema.sql

# Check tables
mysql -u grievance_user -p grievance_portal -e "SHOW TABLES"
```

#### 3. Permission Issues

```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON grievance_portal.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. Data Type Errors

The migration automatically handles most data type conversions. Check the logs for specific issues:

```bash
# Check migration logs
ls -la logs/migration_log_*.txt
tail -f logs/migration_log_*.txt
```

### Migration Logs

All migration activities are logged to `logs/migration_log_TIMESTAMP.txt` including:
- ✅ Successful operations
- ❌ Error details with problematic data
- 📊 Progress updates
- 🔧 Data transformations applied

### Recovery Procedures

#### If Migration Fails

1. **Check the logs** for specific error messages
2. **Fix the issue** (usually connectivity or permissions)
3. **Clear partial data** (optional):
   ```sql
   TRUNCATE TABLE table_name;
   ```
4. **Re-run migration**:
   ```bash
   npm run migrate
   ```

#### Data Validation Failures

1. **Run verification** to identify issues:
   ```bash
   npm run verify
   ```
2. **Fix specific issues** based on the report
3. **Re-run verification** to confirm fixes

## Performance Optimization

### For Large Datasets

- Increase batch size: `MIGRATION_BATCH_SIZE=500`
- Run during off-peak hours
- Monitor MySQL performance during migration
- Consider running specific tables individually:

```javascript
// Custom migration for specific tables
const migrator = new SupabaseToMySQLMigrator();
await migrator.migrateTable('specific_table_name');
```

### MySQL Optimization

```sql
-- Temporarily disable some checks for faster import
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Re-enable after migration
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
SET AUTOCOMMIT = 1;
```

## Default Credentials

### Admin User
- **Email**: admin@grievance.local
- **Password**: admin123 (Please change immediately)
- **Role**: admin

## Support

### Getting Help

1. **Check logs** first: `logs/migration_log_*.txt`
2. **Run verification**: `npm run verify`
3. **Test connections**: `npm test`
4. **Review environment**: Check `.env` file

### Common Solutions

- **"Table doesn't exist"**: Run `npm run install-schema`
- **"Connection refused"**: Check MySQL is running and credentials
- **"Permission denied"**: Verify user permissions in MySQL
- **"Data mismatch"**: Run `npm run verify` for detailed analysis

## Version History

- **v1.0** - Initial schema with complete feature set
- **v1.1** - Added automated Supabase migration tools
- **v1.2** - Enhanced validation and verification scripts
- Supports windsurf-backend architecture
- Compatible with MySQL 8.0+
- Production-ready with comprehensive error handling

---

**Important**: Always backup your databases before running migrations!

```bash
# Backup existing MySQL data
npm run backup

# Backup Supabase (if needed)
# Use Supabase dashboard or pg_dump for PostgreSQL backup
```
