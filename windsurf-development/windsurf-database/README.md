
# Grievance Portal Database Migration

This directory contains the production-ready migration tool to migrate data from Supabase to MySQL for the Grievance Portal application.

## Overview

The migration tool provides a complete solution for:
- Testing database connections
- Migrating data with proper transformations
- Verifying migration success
- Handling errors gracefully
- Batch processing for performance

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL database** with schema already created
3. **Supabase project** with existing data
4. **Environment configuration**

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=grievance_portal

# Migration Settings
BATCH_SIZE=1000
LOG_LEVEL=info
```

## Usage

### 1. Test Connections
Before running migration, test your database connections:
```bash
npm run test-connections
```

### 2. Run Migration
Execute the full migration:
```bash
npm run migrate
```

### 3. Verify Migration
After migration, verify data integrity:
```bash
npm run verify
```

### 4. Debug Mode
Run migration with detailed logging:
```bash
npm run migrate:dry-run
```

## Migration Process

The tool migrates data in the following order:
1. **employees** → **users** table
2. **dashboard_users** → **dashboard_users** table
3. **issues** → **issues** table
4. **issue_comments** → **issue_comments** table
5. **ticket_feedback** → **feedback** table

## Data Transformations

The migration automatically handles:
- UUID format compatibility
- Timestamp format conversion
- JSON data serialization
- Field mapping between different schemas
- Data type conversions

## Error Handling

- **Connection failures**: Stops execution with clear error messages
- **Data transformation errors**: Logs problematic records and continues
- **Batch insertion errors**: Retries with smaller batches
- **Graceful shutdown**: Handles SIGINT/SIGTERM signals

## Monitoring

The tool provides comprehensive logging:
- Connection status
- Migration progress
- Error details
- Verification results
- Performance metrics

## Production Considerations

1. **Backup**: Always backup your MySQL database before migration
2. **Downtime**: Consider application downtime during migration
3. **Resources**: Monitor server resources during large migrations
4. **Verification**: Always run verification after migration
5. **Rollback**: Have a rollback plan ready

## Troubleshooting

### Connection Issues
- Verify database credentials
- Check network connectivity
- Ensure MySQL server is running
- Validate Supabase project access

### Migration Errors
- Check MySQL table schemas exist
- Verify data types compatibility
- Monitor disk space
- Check MySQL user permissions

### Performance Issues
- Adjust BATCH_SIZE environment variable
- Monitor database server resources
- Consider running during off-peak hours

## Support

For issues or questions, check:
1. Environment configuration
2. Database permissions
3. Network connectivity
4. Log output for detailed error information
