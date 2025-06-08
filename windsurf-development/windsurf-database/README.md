
# 📊 Data Migration Guide - Supabase to MySQL

This tool migrates your **real data** from your original Supabase project to the new MySQL database for Windsurf deployment.

## 🎯 What This Does

**Transfers ALL your actual data:**
- Employee records → MySQL users table
- Dashboard users → MySQL dashboard_users table  
- All issues/grievances → MySQL issues table
- Comments and feedback → Respective MySQL tables
- Master data and audit trails

## ⚡ Quick Migration (5 Minutes)

### Step 1: Install Dependencies
```bash
cd windsurf-database
npm install
```

### Step 2: Configure Your Credentials
```bash
cp .env.example .env
```

Edit the `.env` file with your details:
```env
# Your Original Supabase Project (Source)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Your New MySQL Database (Destination)  
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=grievance_user
MYSQL_PASSWORD=grievance_password
MYSQL_DATABASE=grievance_portal

# Migration Settings (Optional)
BATCH_SIZE=1000
LOG_LEVEL=info
```

### Step 3: Run Migration
```bash
# Test connections (recommended first)
npm run test-connections

# Run the full migration
npm run migrate

# Verify everything transferred correctly
npm run verify
```

## 📋 Migration Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run test-connections` | Test database connectivity | Before migration |
| `npm run migrate` | Transfer all data | Main migration |
| `npm run verify` | Check data integrity | After migration |
| `npm run migrate:dry-run` | Debug with detailed logs | If issues occur |

## 🔍 What Happens During Migration

```
🔄 Connecting to Supabase...
✅ Supabase connection successful

🔄 Connecting to MySQL...  
✅ MySQL connection successful

📊 Migrating employees → users: 1,247 records
📊 Migrating dashboard_users: 12 records
📊 Migrating issues: 3,891 records
📊 Migrating issue_comments: 8,234 records
📊 Migrating ticket_feedback: 2,156 records

✅ Migration completed successfully!
🎉 All 15,540 records transferred
```

## 🛠️ Data Transformations

The migration automatically handles:

| Supabase Format | → | MySQL Format |
|-----------------|---|---------------|
| UUID primary keys | → | VARCHAR(36) UUIDs |
| PostgreSQL timestamps | → | MySQL TIMESTAMP |
| JSONB data | → | MySQL JSON |
| Array fields | → | JSON strings |
| Enum types | → | VARCHAR values |

## 📁 File Structure After Migration

```
windsurf-database/
├── migrate_from_supabase.js   # Main migration script
├── package.json               # Dependencies and scripts
├── .env                      # Your configuration
├── logs/                     # Generated during migration
│   ├── migration.log         # Progress and success logs
│   └── migration_errors.log  # Any failed records
└── README.md                 # This file
```

## ❌ Troubleshooting

### Connection Issues
```bash
# Check if Supabase credentials are correct
curl "https://your-project.supabase.co/rest/v1/employees?limit=1" \
  -H "apikey: your-supabase-anon-key"

# Check if MySQL is running
mysql -u grievance_user -p grievance_portal -e "SELECT 1"
```

### Migration Fails Midway
```bash
# Migration can be safely resumed - it skips already migrated records
npm run migrate
```

### Data Mismatches
```bash
# Check verification results
npm run verify

# Review error logs
cat logs/migration_errors.log
```

### Common Fixes

1. **"Connection timeout"**
   - Increase `BATCH_SIZE=500` in .env
   - Check network connectivity

2. **"Permission denied"**
   - Verify MySQL user has full privileges
   - Check Supabase API key permissions

3. **"Some records failed"**
   - Check `logs/migration_errors.log`
   - Fix data issues in Supabase
   - Re-run migration (skips successful records)

## 🔒 Security Notes

- **API Keys**: Keep your `.env` file secure
- **Credentials**: Use read-only Supabase keys if possible
- **Cleanup**: Remove `.env` file after migration if needed

## ✅ Verification Checklist

After migration, verify:

```sql
-- Check record counts match
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'issues', COUNT(*) FROM issues
UNION ALL  
SELECT 'issue_comments', COUNT(*) FROM issue_comments;

-- Spot check data integrity
SELECT * FROM users LIMIT 5;
SELECT * FROM issues ORDER BY created_at DESC LIMIT 5;
```

## 🎯 Expected Results

**Successful migration should show:**
- ✅ All table counts match between Supabase and MySQL
- ✅ Data types properly converted
- ✅ Relationships maintained (foreign keys)
- ✅ Timestamps in correct timezone
- ✅ No critical errors in logs

## 📞 Need Help?

1. **Check logs first**: `logs/migration.log` and `logs/migration_errors.log`
2. **Verify credentials**: Ensure all database access is working
3. **Test connectivity**: Use `npm run test-connections`
4. **Review data**: Check for special characters or data issues in Supabase

---

**⚡ Pro Tip**: Run migration during off-peak hours for better performance with large datasets.

**🔄 Safe to Re-run**: Migration skips already transferred records, so it's safe to run multiple times.
