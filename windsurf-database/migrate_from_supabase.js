
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'grievance_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'grievance_portal',
  charset: 'utf8mb4'
};

// Tables to migrate (in dependency order)
const MIGRATION_TABLES = [
  'master_cities',
  'master_clusters',
  'rbac_roles',
  'rbac_permissions',
  'rbac_role_permissions',
  'employees',
  'dashboard_users',
  'rbac_user_roles',
  'issues',
  'issue_comments',
  'issue_internal_comments',
  'issue_audit_trail',
  'issue_notifications',
  'ticket_feedback',
  'dashboard_user_audit_logs',
  'master_audit_logs'
];

class SupabaseToMySQLMigrator {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.mysqlConnection = null;
    this.migrationLog = [];
    this.errors = [];
    this.stats = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.migrationLog.push(logEntry);
    
    if (type === 'error') {
      this.errors.push(message);
    }
  }

  async connectToMySQL() {
    try {
      this.log('Connecting to MySQL database...');
      this.mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
      this.log('✅ MySQL connection established');
    } catch (error) {
      this.log(`❌ MySQL connection failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testConnections() {
    this.log('🔧 Testing database connections...');
    
    // Test Supabase connection
    try {
      const { data, error } = await this.supabase.from('employees').select('count', { count: 'exact', head: true });
      if (error) throw error;
      this.log('✅ Supabase connection successful');
    } catch (error) {
      this.log(`❌ Supabase connection failed: ${error.message}`, 'error');
      throw error;
    }

    // Test MySQL connection
    await this.connectToMySQL();
    try {
      await this.mysqlConnection.execute('SELECT 1');
      this.log('✅ MySQL connection test successful');
    } catch (error) {
      this.log(`❌ MySQL connection test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async exportTableFromSupabase(tableName) {
    this.log(`📤 Exporting data from Supabase table: ${tableName}`);
    
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        this.log(`❌ Failed to export ${tableName}: ${error.message}`, 'error');
        return [];
      }
      
      this.log(`✅ Exported ${data?.length || 0} records from ${tableName}`);
      return data || [];
    } catch (error) {
      this.log(`❌ Exception exporting ${tableName}: ${error.message}`, 'error');
      return [];
    }
  }

  transformDataForMySQL(tableName, data) {
    if (!data || data.length === 0) return [];

    return data.map(row => {
      const transformedRow = { ...row };

      // Transform boolean values (PostgreSQL true/false → MySQL 1/0)
      Object.keys(transformedRow).forEach(key => {
        if (typeof transformedRow[key] === 'boolean') {
          transformedRow[key] = transformedRow[key] ? 1 : 0;
        }
      });

      // Handle specific table transformations
      switch (tableName) {
        case 'employees':
          // Ensure employee_uuid is properly formatted
          if (!transformedRow.id && transformedRow.employee_uuid) {
            transformedRow.id = transformedRow.employee_uuid;
          }
          // Map emp_id field
          if (transformedRow.employee_id && !transformedRow.emp_id) {
            transformedRow.emp_id = transformedRow.employee_id;
          }
          break;

        case 'issues':
          // Ensure proper UUID format and status mapping
          if (transformedRow.status && !['open', 'in_progress', 'resolved', 'closed'].includes(transformedRow.status)) {
            transformedRow.status = 'open'; // Default fallback
          }
          if (transformedRow.priority && !['low', 'medium', 'high', 'critical'].includes(transformedRow.priority)) {
            transformedRow.priority = 'medium'; // Default fallback
          }
          break;

        case 'ticket_feedback':
          // Ensure sentiment values are valid
          if (transformedRow.sentiment && !['positive', 'neutral', 'negative'].includes(transformedRow.sentiment)) {
            transformedRow.sentiment = 'neutral'; // Default fallback
          }
          break;
      }

      // Handle JSON fields - ensure they're properly stringified
      Object.keys(transformedRow).forEach(key => {
        if (transformedRow[key] && typeof transformedRow[key] === 'object' && transformedRow[key] !== null) {
          transformedRow[key] = JSON.stringify(transformedRow[key]);
        }
      });

      return transformedRow;
    });
  }

  async importTableToMySQL(tableName, data) {
    if (!data || data.length === 0) {
      this.log(`⚠️ No data to import for table: ${tableName}`);
      return;
    }

    this.log(`📥 Importing ${data.length} records to MySQL table: ${tableName}`);

    try {
      // Get table columns from MySQL
      const [columns] = await this.mysqlConnection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
        [MYSQL_CONFIG.database, tableName]
      );

      const tableColumns = columns.map(col => col.COLUMN_NAME);
      
      // Filter data to only include existing columns
      const filteredData = data.map(row => {
        const filteredRow = {};
        tableColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });

      if (filteredData.length === 0) {
        this.log(`⚠️ No valid data after column filtering for: ${tableName}`);
        return;
      }

      // Prepare INSERT statement
      const sampleRow = filteredData[0];
      const insertColumns = Object.keys(sampleRow);
      const placeholders = insertColumns.map(() => '?').join(', ');
      const sql = `INSERT INTO \`${tableName}\` (\`${insertColumns.join('`, `')}\`) VALUES (${placeholders})`;

      let successCount = 0;
      let errorCount = 0;

      // Import data in batches
      const batchSize = 100;
      for (let i = 0; i < filteredData.length; i += batchSize) {
        const batch = filteredData.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            const values = insertColumns.map(col => row[col]);
            await this.mysqlConnection.execute(sql, values);
            successCount++;
          } catch (error) {
            errorCount++;
            this.log(`❌ Failed to insert row in ${tableName}: ${error.message}`, 'error');
            
            // Log the problematic row for debugging
            if (errorCount <= 5) { // Only log first 5 errors to avoid spam
              this.log(`Problematic row: ${JSON.stringify(row)}`, 'error');
            }
          }
        }
        
        // Progress update
        this.log(`📊 Progress: ${Math.min(i + batchSize, filteredData.length)}/${filteredData.length} processed for ${tableName}`);
      }

      this.log(`✅ Import completed for ${tableName}: ${successCount} success, ${errorCount} errors`);
      this.stats[tableName] = { success: successCount, errors: errorCount, total: data.length };

    } catch (error) {
      this.log(`❌ Failed to import table ${tableName}: ${error.message}`, 'error');
      this.stats[tableName] = { success: 0, errors: data.length, total: data.length };
    }
  }

  async migrateTable(tableName) {
    this.log(`🔄 Starting migration for table: ${tableName}`);
    
    try {
      // Export from Supabase
      const data = await this.exportTableFromSupabase(tableName);
      
      if (data.length === 0) {
        this.log(`⚠️ No data found in Supabase table: ${tableName}`);
        return;
      }

      // Transform data for MySQL
      const transformedData = this.transformDataForMySQL(tableName, data);
      
      // Import to MySQL
      await this.importTableToMySQL(tableName, transformedData);
      
    } catch (error) {
      this.log(`❌ Migration failed for table ${tableName}: ${error.message}`, 'error');
    }
  }

  async runMigration() {
    const startTime = Date.now();
    this.log('🚀 Starting Supabase to MySQL migration...');

    try {
      // Test connections
      await this.testConnections();

      // Disable foreign key checks
      this.log('🔧 Disabling foreign key checks...');
      await this.mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');

      // Migrate each table
      for (const tableName of MIGRATION_TABLES) {
        await this.migrateTable(tableName);
      }

      // Re-enable foreign key checks
      this.log('🔧 Re-enabling foreign key checks...');
      await this.mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');

      // Generate summary
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      this.log('🎉 Migration completed!');
      this.log(`⏱️ Total duration: ${duration} seconds`);
      this.generateSummaryReport();

    } catch (error) {
      this.log(`💥 Migration failed: ${error.message}`, 'error');
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
    }
  }

  generateSummaryReport() {
    this.log('\n📊 MIGRATION SUMMARY REPORT');
    this.log('═'.repeat(50));
    
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalRecords = 0;

    Object.entries(this.stats).forEach(([table, stats]) => {
      this.log(`${table.padEnd(25)} | ${stats.success.toString().padStart(6)} success | ${stats.errors.toString().padStart(6)} errors | ${stats.total.toString().padStart(6)} total`);
      totalSuccess += stats.success;
      totalErrors += stats.errors;
      totalRecords += stats.total;
    });

    this.log('─'.repeat(50));
    this.log(`${'TOTALS'.padEnd(25)} | ${totalSuccess.toString().padStart(6)} success | ${totalErrors.toString().padStart(6)} errors | ${totalRecords.toString().padStart(6)} total`);
    this.log('═'.repeat(50));

    if (this.errors.length > 0) {
      this.log(`\n⚠️ ${this.errors.length} errors encountered during migration`);
      this.log('Check the log file for detailed error information');
    }

    // Save detailed log to file
    this.saveLogToFile();
  }

  saveLogToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `migration_log_${timestamp}.txt`;
    const logPath = path.join(__dirname, 'logs', logFileName);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.writeFileSync(logPath, this.migrationLog.join('\n'), 'utf8');
    this.log(`📄 Detailed log saved to: ${logPath}`);
  }
}

// Main execution
async function main() {
  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  if (!MYSQL_CONFIG.password) {
    console.error('❌ Missing required environment variable: DB_PASSWORD');
    process.exit(1);
  }

  const migrator = new SupabaseToMySQLMigrator();
  
  try {
    await migrator.runMigration();
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

module.exports = { SupabaseToMySQLMigrator };
