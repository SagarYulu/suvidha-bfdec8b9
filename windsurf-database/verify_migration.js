
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
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

const TABLES_TO_VERIFY = [
  'employees',
  'dashboard_users',
  'issues',
  'issue_comments',
  'issue_internal_comments',
  'issue_audit_trail',
  'issue_notifications',
  'ticket_feedback',
  'master_cities',
  'master_clusters',
  'rbac_roles',
  'rbac_permissions',
  'rbac_role_permissions',
  'rbac_user_roles',
  'dashboard_user_audit_logs',
  'master_audit_logs'
];

class MigrationVerifier {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.mysqlConnection = null;
    this.verificationResults = {};
    this.issues = [];
  }

  async connectToMySQL() {
    this.mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
  }

  async getSupabaseCount(tableName) {
    try {
      const { count, error } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`⚠️ Could not get count from Supabase table ${tableName}: ${error.message}`);
        return null;
      }
      
      return count;
    } catch (error) {
      console.log(`⚠️ Error accessing Supabase table ${tableName}: ${error.message}`);
      return null;
    }
  }

  async getMySQLCount(tableName) {
    try {
      const [rows] = await this.mysqlConnection.execute(
        `SELECT COUNT(*) as count FROM \`${tableName}\``
      );
      return rows[0].count;
    } catch (error) {
      console.log(`⚠️ Could not get count from MySQL table ${tableName}: ${error.message}`);
      return null;
    }
  }

  async verifyTableCounts() {
    console.log('📊 Verifying record counts between Supabase and MySQL...\n');
    console.log('Table Name'.padEnd(30) + 'Supabase'.padEnd(12) + 'MySQL'.padEnd(12) + 'Status');
    console.log('─'.repeat(66));

    for (const tableName of TABLES_TO_VERIFY) {
      const supabaseCount = await this.getSupabaseCount(tableName);
      const mysqlCount = await this.getMySQLCount(tableName);
      
      let status = '❓ Unknown';
      if (supabaseCount !== null && mysqlCount !== null) {
        if (supabaseCount === mysqlCount) {
          status = '✅ Match';
        } else {
          status = '❌ Mismatch';
          this.issues.push(`${tableName}: Supabase has ${supabaseCount} records, MySQL has ${mysqlCount}`);
        }
      } else if (mysqlCount !== null && supabaseCount === null) {
        status = '⚠️ Source unavailable';
      } else if (mysqlCount === null) {
        status = '❌ Target missing';
        this.issues.push(`${tableName}: Table not found in MySQL`);
      }

      const supabaseStr = supabaseCount !== null ? supabaseCount.toString() : 'N/A';
      const mysqlStr = mysqlCount !== null ? mysqlCount.toString() : 'N/A';
      
      console.log(tableName.padEnd(30) + supabaseStr.padEnd(12) + mysqlStr.padEnd(12) + status);
      
      this.verificationResults[tableName] = {
        supabaseCount,
        mysqlCount,
        status: status.replace(/[✅❌⚠️❓] /, '')
      };
    }
  }

  async verifyDataIntegrity() {
    console.log('\n🔍 Verifying data integrity...\n');

    // Check for NULL values in required fields
    const criticalFields = {
      'employees': ['id', 'emp_id', 'name', 'email'],
      'issues': ['id', 'employee_uuid', 'type_id', 'sub_type_id', 'description', 'status'],
      'dashboard_users': ['id', 'name', 'email', 'role']
    };

    for (const [tableName, fields] of Object.entries(criticalFields)) {
      for (const field of fields) {
        try {
          const [rows] = await this.mysqlConnection.execute(
            `SELECT COUNT(*) as count FROM \`${tableName}\` WHERE \`${field}\` IS NULL OR \`${field}\` = ''`
          );
          
          if (rows[0].count > 0) {
            const issue = `${tableName}.${field}: ${rows[0].count} NULL/empty values found`;
            console.log(`❌ ${issue}`);
            this.issues.push(issue);
          } else {
            console.log(`✅ ${tableName}.${field}: No NULL/empty values`);
          }
        } catch (error) {
          console.log(`⚠️ Could not verify ${tableName}.${field}: ${error.message}`);
        }
      }
    }
  }

  async verifyForeignKeys() {
    console.log('\n🔗 Verifying foreign key relationships...\n');

    const foreignKeyChecks = [
      {
        table: 'issues',
        field: 'employee_uuid', 
        references: 'employees',
        referencedField: 'id'
      },
      {
        table: 'issue_comments',
        field: 'issue_id',
        references: 'issues',
        referencedField: 'id'
      },
      {
        table: 'issue_internal_comments',
        field: 'issue_id',
        references: 'issues',
        referencedField: 'id'
      },
      {
        table: 'issue_audit_trail',
        field: 'issue_id',
        references: 'issues',
        referencedField: 'id'
      },
      {
        table: 'ticket_feedback',
        field: 'issue_id',
        references: 'issues',
        referencedField: 'id'
      }
    ];

    for (const check of foreignKeyChecks) {
      try {
        const [rows] = await this.mysqlConnection.execute(`
          SELECT COUNT(*) as count 
          FROM \`${check.table}\` t1
          LEFT JOIN \`${check.references}\` t2 ON t1.\`${check.field}\` = t2.\`${check.referencedField}\`
          WHERE t1.\`${check.field}\` IS NOT NULL AND t2.\`${check.referencedField}\` IS NULL
        `);
        
        if (rows[0].count > 0) {
          const issue = `${check.table}.${check.field}: ${rows[0].count} orphaned references`;
          console.log(`❌ ${issue}`);
          this.issues.push(issue);
        } else {
          console.log(`✅ ${check.table}.${check.field} → ${check.references}.${check.referencedField}: No orphaned references`);
        }
      } catch (error) {
        console.log(`⚠️ Could not verify FK ${check.table}.${check.field}: ${error.message}`);
      }
    }
  }

  async verifyDataTypes() {
    console.log('\n🔧 Verifying data type conversions...\n');

    // Check boolean conversions (should be 0 or 1 in MySQL)
    const booleanFields = [
      { table: 'issue_notifications', field: 'is_read' },
      { table: 'dashboard_users', field: 'is_active' }
    ];

    for (const { table, field } of booleanFields) {
      try {
        const [rows] = await this.mysqlConnection.execute(`
          SELECT COUNT(*) as count 
          FROM \`${table}\` 
          WHERE \`${field}\` NOT IN (0, 1)
        `);
        
        if (rows[0].count > 0) {
          const issue = `${table}.${field}: ${rows[0].count} invalid boolean values`;
          console.log(`❌ ${issue}`);
          this.issues.push(issue);
        } else {
          console.log(`✅ ${table}.${field}: All boolean values valid`);
        }
      } catch (error) {
        console.log(`⚠️ Could not verify boolean field ${table}.${field}: ${error.message}`);
      }
    }

    // Check JSON fields
    const jsonFields = [
      { table: 'issues', field: 'attachments' },
      { table: 'issue_audit_trail', field: 'details' }
    ];

    for (const { table, field } of jsonFields) {
      try {
        const [rows] = await this.mysqlConnection.execute(`
          SELECT COUNT(*) as count 
          FROM \`${table}\` 
          WHERE \`${field}\` IS NOT NULL 
          AND NOT JSON_VALID(\`${field}\`)
        `);
        
        if (rows[0].count > 0) {
          const issue = `${table}.${field}: ${rows[0].count} invalid JSON values`;
          console.log(`❌ ${issue}`);
          this.issues.push(issue);
        } else {
          console.log(`✅ ${table}.${field}: All JSON values valid`);
        }
      } catch (error) {
        console.log(`⚠️ Could not verify JSON field ${table}.${field}: ${error.message}`);
      }
    }
  }

  async runVerification() {
    console.log('🔍 Starting migration verification...\n');

    try {
      await this.connectToMySQL();
      
      await this.verifyTableCounts();
      await this.verifyDataIntegrity();
      await this.verifyForeignKeys();
      await this.verifyDataTypes();
      
      this.generateVerificationReport();
      
    } catch (error) {
      console.error('💥 Verification failed:', error.message);
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
    }
  }

  generateVerificationReport() {
    console.log('\n📋 VERIFICATION REPORT');
    console.log('═'.repeat(50));
    
    const totalTables = TABLES_TO_VERIFY.length;
    const matchingTables = Object.values(this.verificationResults)
      .filter(result => result.status === 'Match').length;
    
    console.log(`Tables verified: ${totalTables}`);
    console.log(`Record count matches: ${matchingTables}/${totalTables}`);
    console.log(`Issues found: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n⚠️ ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n🎉 No issues found! Migration appears successful.');
    }
    
    console.log('\n═'.repeat(50));
  }
}

// Main execution
async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  if (!MYSQL_CONFIG.password) {
    console.error('❌ Missing required environment variable: DB_PASSWORD');
    process.exit(1);
  }

  const verifier = new MigrationVerifier();
  
  try {
    await verifier.runVerification();
    
    if (verifier.issues.length === 0) {
      console.log('\n✅ Verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Verification completed with issues. Please review the report above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification if called directly
if (require.main === module) {
  main();
}

module.exports = { MigrationVerifier };
