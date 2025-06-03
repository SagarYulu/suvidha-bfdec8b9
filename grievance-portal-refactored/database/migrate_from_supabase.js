
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Configuration
const config = {
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  batchSize: parseInt(process.env.BATCH_SIZE) || 1000,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Initialize clients
const supabase = createClient(config.supabase.url, config.supabase.key);
let mysqlConnection;

// Logging setup
const logsDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);

const logFile = path.join(logsDir, 'migration.log');
const errorLogFile = path.join(logsDir, 'migration_errors.log');

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  console.log(logMessage);
  if (data) console.log(JSON.stringify(data, null, 2));
  
  fs.appendFileSync(logFile, logMessage + '\n');
  if (data) fs.appendFileSync(logFile, JSON.stringify(data, null, 2) + '\n');
}

function logError(message, error, data = null) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ERROR: ${message}\n${error.stack}\n`;
  
  console.error(errorMessage);
  if (data) console.error('Data:', JSON.stringify(data, null, 2));
  
  fs.appendFileSync(errorLogFile, errorMessage);
  if (data) fs.appendFileSync(errorLogFile, 'Data: ' + JSON.stringify(data, null, 2) + '\n');
}

// Table migration configurations
const tableMigrations = [
  {
    name: 'master_cities',
    supabaseTable: 'master_cities',
    dependencies: []
  },
  {
    name: 'master_clusters', 
    supabaseTable: 'master_clusters',
    dependencies: ['master_cities']
  },
  {
    name: 'master_roles',
    supabaseTable: 'master_roles', 
    dependencies: []
  },
  {
    name: 'rbac_permissions',
    supabaseTable: 'rbac_permissions',
    dependencies: []
  },
  {
    name: 'rbac_roles',
    supabaseTable: 'rbac_roles',
    dependencies: []
  },
  {
    name: 'rbac_role_permissions',
    supabaseTable: 'rbac_role_permissions',
    dependencies: ['rbac_roles', 'rbac_permissions']
  },
  {
    name: 'employees',
    supabaseTable: 'employees',
    dependencies: []
  },
  {
    name: 'dashboard_users',
    supabaseTable: 'dashboard_users',
    dependencies: []
  },
  {
    name: 'rbac_user_roles',
    supabaseTable: 'rbac_user_roles',
    dependencies: ['rbac_roles', 'dashboard_users', 'employees']
  },
  {
    name: 'issues',
    supabaseTable: 'issues',
    dependencies: ['employees']
  },
  {
    name: 'issue_comments',
    supabaseTable: 'issue_comments',
    dependencies: ['issues']
  },
  {
    name: 'issue_internal_comments',
    supabaseTable: 'issue_internal_comments',
    dependencies: ['issues']
  },
  {
    name: 'issue_audit_trail',
    supabaseTable: 'issue_audit_trail',
    dependencies: ['issues']
  },
  {
    name: 'issue_notifications',
    supabaseTable: 'issue_notifications',
    dependencies: ['issues']
  },
  {
    name: 'ticket_feedback',
    supabaseTable: 'ticket_feedback',
    dependencies: ['issues']
  },
  {
    name: 'dashboard_user_audit_logs',
    supabaseTable: 'dashboard_user_audit_logs',
    dependencies: []
  },
  {
    name: 'master_audit_logs',
    supabaseTable: 'master_audit_logs',
    dependencies: ['employees']
  }
];

// Data transformation functions
function transformRow(tableName, row) {
  const transformed = { ...row };
  
  // Convert PostgreSQL specific types to MySQL compatible types
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    if (value === null || value === undefined) {
      return;
    }
    
    // Handle JSON/JSONB columns
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      transformed[key] = JSON.stringify(value);
    }
    
    // Handle array columns (convert to JSON)
    if (Array.isArray(value)) {
      transformed[key] = JSON.stringify(value);
    }
    
    // Handle date/timestamp conversion
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/))) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        transformed[key] = date.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
  });
  
  return transformed;
}

async function migrateTable(tableConfig) {
  const { name, supabaseTable } = tableConfig;
  
  log('info', `Starting migration for table: ${name}`);
  
  try {
    // Get total count from Supabase
    const { count, error: countError } = await supabase
      .from(supabaseTable)
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      throw new Error(`Failed to get count for ${supabaseTable}: ${countError.message}`);
    }
    
    log('info', `Total records to migrate from ${supabaseTable}: ${count}`);
    
    if (count === 0) {
      log('info', `No records found in ${supabaseTable}, skipping`);
      return { success: true, migrated: 0, errors: 0 };
    }
    
    let migrated = 0;
    let errors = 0;
    let offset = 0;
    
    // Check if we have existing data (for resume capability)
    const [existingCount] = await mysqlConnection.execute(
      `SELECT COUNT(*) as count FROM ${name}`
    );
    
    if (existingCount[0].count > 0) {
      log('info', `Found ${existingCount[0].count} existing records in ${name}, will check for duplicates`);
    }
    
    while (offset < count) {
      const batchSize = Math.min(config.batchSize, count - offset);
      
      log('info', `Fetching batch: ${offset + 1} to ${offset + batchSize} of ${count}`);
      
      // Fetch batch from Supabase
      const { data, error } = await supabase
        .from(supabaseTable)
        .select('*')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: true });
        
      if (error) {
        throw new Error(`Failed to fetch data from ${supabaseTable}: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        log('info', `No data in batch ${offset}-${offset + batchSize}, breaking`);
        break;
      }
      
      // Process batch
      for (const row of data) {
        try {
          const transformedRow = transformRow(name, row);
          
          // Check if record already exists
          const primaryKey = 'id';
          const [existing] = await mysqlConnection.execute(
            `SELECT ${primaryKey} FROM ${name} WHERE ${primaryKey} = ?`,
            [transformedRow[primaryKey]]
          );
          
          if (existing.length > 0) {
            log('debug', `Record ${transformedRow[primaryKey]} already exists in ${name}, skipping`);
            continue;
          }
          
          // Prepare insert statement
          const columns = Object.keys(transformedRow);
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(col => transformedRow[col]);
          
          const insertQuery = `INSERT INTO ${name} (${columns.join(', ')}) VALUES (${placeholders})`;
          
          await mysqlConnection.execute(insertQuery, values);
          migrated++;
          
        } catch (error) {
          errors++;
          logError(`Failed to insert record into ${name}`, error, row);
        }
      }
      
      offset += batchSize;
      log('info', `Batch completed. Migrated: ${migrated}, Errors: ${errors}`);
      
      // Small delay to prevent overwhelming the databases
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    log('info', `Migration completed for ${name}. Total migrated: ${migrated}, Errors: ${errors}`);
    return { success: true, migrated, errors };
    
  } catch (error) {
    logError(`Migration failed for table ${name}`, error);
    return { success: false, migrated: 0, errors: 1 };
  }
}

async function initializeConnections() {
  log('info', 'Initializing database connections');
  
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('employees')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    log('info', 'Supabase connection successful');
    
    // Initialize MySQL connection
    mysqlConnection = await mysql.createConnection(config.mysql);
    
    // Test MySQL connection
    await mysqlConnection.execute('SELECT 1');
    log('info', 'MySQL connection successful');
    
    return true;
  } catch (error) {
    logError('Failed to initialize database connections', error);
    return false;
  }
}

async function cleanup() {
  if (mysqlConnection) {
    await mysqlConnection.end();
    log('info', 'MySQL connection closed');
  }
}

async function main() {
  const startTime = Date.now();
  log('info', 'Starting Supabase to MySQL migration');
  
  try {
    // Initialize connections
    const connectionsOk = await initializeConnections();
    if (!connectionsOk) {
      process.exit(1);
    }
    
    // Disable foreign key checks for migration
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    log('info', 'Disabled foreign key checks');
    
    const results = {
      totalTables: tableMigrations.length,
      successful: 0,
      failed: 0,
      totalMigrated: 0,
      totalErrors: 0
    };
    
    // Migrate tables in dependency order
    for (const tableConfig of tableMigrations) {
      const result = await migrateTable(tableConfig);
      
      if (result.success) {
        results.successful++;
        results.totalMigrated += result.migrated;
        results.totalErrors += result.errors;
      } else {
        results.failed++;
        results.totalErrors++;
      }
    }
    
    // Re-enable foreign key checks
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    log('info', 'Re-enabled foreign key checks');
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    log('info', 'Migration completed!');
    log('info', `Results:`, results);
    log('info', `Duration: ${duration} seconds`);
    
    if (results.failed > 0) {
      log('error', `${results.failed} tables failed to migrate. Check error logs.`);
      process.exit(1);
    }
    
  } catch (error) {
    logError('Migration failed with critical error', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('info', 'Received SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('info', 'Received SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});

// Run migration
if (require.main === module) {
  main().catch(error => {
    logError('Unhandled error in main', error);
    process.exit(1);
  });
}

module.exports = { main, migrateTable, transformRow };
