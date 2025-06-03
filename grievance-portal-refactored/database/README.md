
# Database Migration Scripts

This directory contains scripts to migrate data from Supabase (PostgreSQL) to MySQL for the Grievance Portal.

## Prerequisites

1. Node.js 16+ installed
2. Access to your Supabase project
3. MySQL 8.0+ database set up and running
4. Network access to both databases

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create MySQL database and schema:**
   ```bash
   mysql -u root -p
   CREATE DATABASE grievance_portal;
   mysql -u root -p grievance_portal < schema.sql
   ```

## Migration Process

### Step 1: Pre-Migration Check
Verify source data and destination database:
```bash
npm run pre-check
```

### Step 2: Run Migration
Execute the full migration:
```bash
npm run migrate
```

### Step 3: Verify Migration
Validate the migrated data:
```bash
npm run verify
```

## Migration Scripts

- **`pre_migration_check.js`**: Validates source and destination databases
- **`migrate_from_supabase.js`**: Main migration script with error handling
- **`verify_migration.js`**: Post-migration validation and reporting

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `MYSQL_HOST` | MySQL server host | `localhost` |
| `MYSQL_PORT` | MySQL server port | `3306` |
| `MYSQL_USER` | MySQL username | `grievance_user` |
| `MYSQL_PASSWORD` | MySQL password | `your_password` |
| `MYSQL_DATABASE` | MySQL database name | `grievance_portal` |
| `BATCH_SIZE` | Records per batch | `1000` |
| `LOG_LEVEL` | Logging level | `info` |

## Data Transformations

The migration handles these transformations:

- **UUIDs**: PostgreSQL UUIDs converted to VARCHAR(36)
- **JSON**: PostgreSQL JSONB converted to MySQL JSON
- **Timestamps**: PostgreSQL timestamptz converted to MySQL TIMESTAMP
- **Enums**: PostgreSQL enums converted to MySQL ENUM or VARCHAR
- **Arrays**: PostgreSQL arrays converted to MySQL JSON

## Error Handling

- Failed records are logged to `logs/migration_errors.log`
- Migration can be resumed from the last successful batch
- Data validation ensures referential integrity

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Increase `acquireTimeout` in database config
   - Check network connectivity

2. **Large Dataset Migration**
   - Reduce `BATCH_SIZE` in environment variables
   - Run migration during off-peak hours

3. **Foreign Key Constraints**
   - Migration temporarily disables FK checks
   - Verify relationships after migration

4. **Character Encoding**
   - Ensure MySQL uses `utf8mb4` charset
   - Check for special characters in text fields

### Logs

Migration logs are stored in:
- `logs/migration.log` - General migration progress
- `logs/migration_errors.log` - Failed records and errors
- `logs/verification.log` - Post-migration validation results

## Manual Data Fixes

If automatic migration fails for specific records:

1. Check `logs/migration_errors.log` for details
2. Fix data issues in source database
3. Re-run migration (will skip successfully migrated records)
4. Or manually insert/update problem records in MySQL

## Support

For migration issues:
1. Check logs in the `logs/` directory
2. Verify environment configuration
3. Test connection to both databases
4. Review data types and constraints
