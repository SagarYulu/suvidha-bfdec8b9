
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
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

class PreMigrationChecker {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.mysqlConnection = null;
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'warning') {
      this.warnings.push(message);
    } else {
      this.checks.push(message);
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔧 Checking environment variables...\n');

    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY', 
      'DB_PASSWORD'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.log(`Missing required environment variable: ${varName}`, 'error');
      } else {
        this.log(`Environment variable ${varName} is set`);
      }
    }

    // Check optional variables
    const optionalVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.log(`Using default value for ${varName}`, 'warning');
      }
    }
  }

  async checkSupabaseConnection() {
    console.log('\n📡 Testing Supabase connection...\n');

    try {
      const { data, error } = await this.supabase.from('employees').select('count', { count: 'exact', head: true });
      
      if (error) {
        this.log(`Supabase connection failed: ${error.message}`, 'error');
        return false;
      }
      
      this.log('Supabase connection successful');
      this.log(`Found ${data || 0} employees in source database`);
      return true;
      
    } catch (error) {
      this.log(`Supabase connection exception: ${error.message}`, 'error');
      return false;
    }
  }

  async checkMySQLConnection() {
    console.log('\n🐬 Testing MySQL connection...\n');

    try {
      this.mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
      await this.mysqlConnection.execute('SELECT 1');
      
      this.log('MySQL connection successful');
      
      // Check database exists
      const [rows] = await this.mysqlConnection.execute('SELECT DATABASE() as db');
      this.log(`Connected to database: ${rows[0].db}`);
      
      return true;
      
    } catch (error) {
      this.log(`MySQL connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkMySQLSchema() {
    console.log('\n🗄️ Checking MySQL schema...\n');

    if (!this.mysqlConnection) {
      this.log('No MySQL connection available for schema check', 'error');
      return false;
    }

    const expectedTables = [
      'employees', 'dashboard_users', 'issues', 'issue_comments',
      'issue_internal_comments', 'issue_audit_trail', 'issue_notifications',
      'ticket_feedback', 'master_cities', 'master_clusters', 'rbac_roles',
      'rbac_permissions', 'rbac_role_permissions', 'rbac_user_roles',
      'dashboard_user_audit_logs', 'master_audit_logs'
    ];

    try {
      const [tables] = await this.mysqlConnection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        ORDER BY TABLE_NAME
      `, [MYSQL_CONFIG.database]);

      const existingTables = tables.map(row => row.TABLE_NAME);
      
      for (const tableName of expectedTables) {
        if (existingTables.includes(tableName)) {
          this.log(`Table ${tableName} exists`);
        } else {
          this.log(`Missing required table: ${tableName}`, 'error');
        }
      }

      // Check for unexpected tables
      const unexpectedTables = existingTables.filter(table => !expectedTables.includes(table));
      if (unexpectedTables.length > 0) {
        this.log(`Found unexpected tables: ${unexpectedTables.join(', ')}`, 'warning');
      }

      return this.errors.length === 0;

    } catch (error) {
      this.log(`Schema check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkDataSizes() {
    console.log('\n📊 Checking data sizes...\n');

    const largeTableThreshold = 10000;

    try {
      const tables = ['employees', 'issues', 'issue_comments', 'ticket_feedback'];
      
      for (const tableName of tables) {
        const { count, error } = await this.supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          this.log(`Could not get size for ${tableName}: ${error.message}`, 'warning');
          continue;
        }
        
        this.log(`Table ${tableName}: ${count} records`);
        
        if (count > largeTableThreshold) {
          this.log(`Large table detected: ${tableName} (${count} records). Migration may take longer.`, 'warning');
        }
      }

    } catch (error) {
      this.log(`Data size check failed: ${error.message}`, 'warning');
    }
  }

  async checkDiskSpace() {
    console.log('\n💾 Checking disk space...\n');

    try {
      const [rows] = await this.mysqlConnection.execute(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [MYSQL_CONFIG.database]);

      const currentSizeMB = rows[0].size_mb || 0;
      this.log(`Current MySQL database size: ${currentSizeMB} MB`);

      // Estimate migration space requirements (rough estimate: 2x current size)
      const estimatedRequiredMB = currentSizeMB * 3; // Current + migration data + buffer
      this.log(`Estimated space required for migration: ${estimatedRequiredMB} MB`);

      if (estimatedRequiredMB > 1000) {
        this.log(`Large migration detected (${estimatedRequiredMB} MB). Ensure sufficient disk space.`, 'warning');
      }

    } catch (error) {
      this.log(`Disk space check failed: ${error.message}`, 'warning');
    }
  }

  async checkExistingData() {
    console.log('\n🔍 Checking for existing data in target database...\n');

    if (!this.mysqlConnection) {
      this.log('No MySQL connection available for data check', 'error');
      return;
    }

    const tablesWithData = [];

    try {
      const [tables] = await this.mysqlConnection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ?
      `, [MYSQL_CONFIG.database]);

      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        
        try {
          const [rows] = await this.mysqlConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          const count = rows[0].count;
          
          if (count > 0) {
            tablesWithData.push({ table: tableName, count });
            this.log(`Table ${tableName} already contains ${count} records`, 'warning');
          }
        } catch (error) {
          // Skip tables we can't query
          continue;
        }
      }

      if (tablesWithData.length > 0) {
        this.log('⚠️ IMPORTANT: Target database contains existing data!');
        this.log('Migration will attempt to insert new records. This may cause:');
        this.log('- Duplicate key errors if records already exist');
        this.log('- Data inconsistency');
        this.log('Consider backing up and clearing the target database first.');
      } else {
        this.log('Target database is empty - ready for migration');
      }

    } catch (error) {
      this.log(`Existing data check failed: ${error.message}`, 'warning');
    }
  }

  async runAllChecks() {
    console.log('🚀 Running pre-migration checks...\n');

    await this.checkEnvironmentVariables();
    
    const supabaseOk = await this.checkSupabaseConnection();
    const mysqlOk = await this.checkMySQLConnection();
    
    if (mysqlOk) {
      await this.checkMySQLSchema();
      await this.checkDiskSpace();
      await this.checkExistingData();
    }
    
    if (supabaseOk) {
      await this.checkDataSizes();
    }

    this.generateSummary();
    
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
    }

    return this.errors.length === 0;
  }

  generateSummary() {
    console.log('\n📋 PRE-MIGRATION CHECK SUMMARY');
    console.log('═'.repeat(50));
    
    console.log(`✅ Successful checks: ${this.checks.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS THAT MUST BE FIXED:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS TO REVIEW:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 All critical checks passed! You can proceed with migration.');
      console.log('\nTo run the migration:');
      console.log('  node migrate_from_supabase.js');
    } else {
      console.log('\n🛑 Please fix the errors above before running migration.');
    }
    
    console.log('\n═'.repeat(50));
  }
}

// Main execution
async function main() {
  const checker = new PreMigrationChecker();
  
  try {
    const success = await checker.runAllChecks();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Pre-migration check failed:', error.message);
    process.exit(1);
  }
}

// Run check if called directly
if (require.main === module) {
  main();
}

module.exports = { PreMigrationChecker };
