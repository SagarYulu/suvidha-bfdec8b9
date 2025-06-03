
# Data Migration from Supabase to MySQL

This document provides instructions for migrating your existing data from Supabase to the new MySQL database.

## Overview

The migration process involves:
1. Exporting data from Supabase
2. Transforming the data format (PostgreSQL → MySQL)
3. Importing data into MySQL

## Prerequisites

- Access to your Supabase project
- Supabase CLI installed (optional but recommended)
- MySQL database set up with the new schema

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Export Data from Supabase

1. **Login to Supabase Dashboard**:
   - Go to https://app.supabase.com
   - Select your project

2. **Export Tables**:
   For each table, go to Table Editor and use the export feature:
   
   **Tables to export:**
   - `employees`
   - `dashboard_users`
   - `issues`
   - `issue_comments`
   - `issue_internal_comments`
   - `issue_audit_trail`
   - `issue_notifications`
   - `ticket_feedback`
   - `master_cities`
   - `master_clusters`
   - `rbac_permissions`
   - `rbac_roles`
   - `rbac_role_permissions`
   - `rbac_user_roles`

3. **Download as CSV**:
   - Click on the table
   - Click "Export" → "CSV"
   - Save each file with the table name

### Step 2: Transform Data

The main differences between PostgreSQL (Supabase) and MySQL are:

1. **UUID Format**: Both systems use UUIDs, but ensure they're valid
2. **Boolean Values**: PostgreSQL uses `true/false`, MySQL uses `1/0`
3. **JSON Fields**: Should work without changes
4. **Timestamp Format**: May need adjustment

### Step 3: Import Data to MySQL

Use the provided import script:

```bash
cd grievance-portal-refactored/database
node import_from_csv.js
```

## Method 2: Using SQL Export/Import

### Step 1: Generate SQL Dump from Supabase

1. **Using Supabase CLI**:
   ```bash
   supabase db dump --data-only --file supabase_data.sql
   ```

2. **Or using pg_dump directly**:
   ```bash
   pg_dump -h db.PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres --data-only > supabase_data.sql
   ```

### Step 2: Transform SQL

Run the transformation script:

```bash
cd grievance-portal-refactored/database
node transform_sql.js supabase_data.sql mysql_data.sql
```

### Step 3: Import to MySQL

```bash
mysql -u grievance_user -p grievance_portal < mysql_data.sql
```

## Method 3: Custom Migration Script

For complex data transformations, use the provided migration script:

```bash
cd grievance-portal-refactored/database
cp migration_config.example.js migration_config.js
# Edit migration_config.js with your Supabase credentials
node migrate_data.js
```

## Data Mapping

### Table Mappings

| Supabase Table | MySQL Table | Notes |
|---------------|-------------|-------|
| `employees` | `employees` | Direct mapping |
| `dashboard_users` | `dashboard_users` | Direct mapping |
| `issues` | `issues` | UUID fields remain the same |
| `issue_comments` | `issue_comments` | Direct mapping |
| `issue_internal_comments` | `issue_internal_comments` | Direct mapping |
| `issue_audit_trail` | `issue_audit_trail` | JSON fields preserved |
| `issue_notifications` | `issue_notifications` | Boolean conversion needed |
| `ticket_feedback` | `ticket_feedback` | Direct mapping |

### Field Transformations

1. **Boolean Fields**:
   - `is_read` in `issue_notifications`: `true` → `1`, `false` → `0`
   - `is_active` in `dashboard_users`: `true` → `1`, `false` → `0`

2. **Enum Fields**:
   - `status` in `issues`: Ensure values match MySQL enum
   - `priority` in `issues`: Ensure values match MySQL enum
   - `sentiment` in `ticket_feedback`: Ensure values match MySQL enum

3. **JSON Fields**:
   - Should work without modification
   - Verify JSON structure is preserved

## Verification Steps

After migration, run these queries to verify data integrity:

```sql
-- Check record counts
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'dashboard_users', COUNT(*) FROM dashboard_users
UNION ALL
SELECT 'issues', COUNT(*) FROM issues
UNION ALL
SELECT 'issue_comments', COUNT(*) FROM issue_comments;

-- Check for NULL IDs
SELECT 'employees' as table_name, COUNT(*) as null_ids FROM employees WHERE id IS NULL
UNION ALL
SELECT 'issues', COUNT(*) FROM issues WHERE id IS NULL;

-- Verify foreign key relationships
SELECT COUNT(*) as orphaned_comments 
FROM issue_comments ic 
LEFT JOIN issues i ON ic.issue_id = i.id 
WHERE i.id IS NULL;

-- Check enum values
SELECT DISTINCT status FROM issues;
SELECT DISTINCT priority FROM issues;
SELECT DISTINCT sentiment FROM ticket_feedback;
```

## Troubleshooting

### Common Issues

1. **UUID Format Errors**:
   ```sql
   -- Fix invalid UUIDs
   UPDATE table_name SET id = UUID() WHERE id IS NULL OR id = '';
   ```

2. **Date Format Issues**:
   ```sql
   -- Convert timestamp strings
   UPDATE table_name SET created_at = STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s');
   ```

3. **JSON Format Issues**:
   ```sql
   -- Validate JSON fields
   SELECT id FROM table_name WHERE JSON_VALID(json_field) = 0;
   ```

4. **Foreign Key Violations**:
   - Temporarily disable foreign key checks during import
   - Verify all referenced records exist

### Recovery Steps

If migration fails:

1. **Restore from backup**:
   ```bash
   mysql -u grievance_user -p grievance_portal < backup.sql
   ```

2. **Re-run schema**:
   ```bash
   mysql -u grievance_user -p grievance_portal < schema.sql
   ```

3. **Partial re-import**:
   - Import tables one by one
   - Skip problematic records temporarily

## Post-Migration Tasks

1. **Update sequences/auto-increment** (if any)
2. **Rebuild indexes** for performance
3. **Test application functionality**
4. **Update application configuration** to use MySQL
5. **Set up monitoring and backups**

## Support

For migration issues:

1. Check the logs in `migration.log`
2. Verify your Supabase connection details
3. Ensure MySQL user has proper permissions
4. Test with a small subset of data first

## Migration Script Templates

See the `scripts/` directory for:
- `csv_import.js` - Import from CSV files
- `transform_sql.js` - Convert PostgreSQL to MySQL
- `migrate_data.js` - Direct database-to-database migration
- `verify_migration.js` - Data verification tool
