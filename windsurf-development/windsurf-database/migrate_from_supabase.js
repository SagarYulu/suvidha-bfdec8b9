
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const batchSize = parseInt(process.env.BATCH_SIZE) || 1000;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'grievance_user',
  password: process.env.MYSQL_PASSWORD || 'grievance_password',
  database: process.env.MYSQL_DATABASE || 'grievance_portal'
};

async function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function migrateTable(tableName, supabaseTable, mysqlTable, transformFn = null) {
  try {
    log(`Starting migration for ${tableName}...`);
    
    // Get total count
    const { count } = await supabase
      .from(supabaseTable)
      .select('*', { count: 'exact', head: true });
    
    log(`Found ${count} records in ${tableName}`);
    
    if (count === 0) {
      log(`No records to migrate for ${tableName}`);
      return;
    }
    
    const connection = await mysql.createConnection(mysqlConfig);
    
    let offset = 0;
    let migratedCount = 0;
    
    while (offset < count) {
      const { data, error } = await supabase
        .from(supabaseTable)
        .select('*')
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform data if transform function provided
        const transformedData = transformFn ? data.map(transformFn) : data;
        
        // Insert into MySQL
        for (const record of transformedData) {
          const columns = Object.keys(record).join(', ');
          const placeholders = Object.keys(record).map(() => '?').join(', ');
          const values = Object.values(record);
          
          await connection.execute(
            `INSERT INTO ${mysqlTable} (${columns}) VALUES (${placeholders})`,
            values
          );
        }
        
        migratedCount += data.length;
        log(`Migrated ${migratedCount}/${count} records for ${tableName}`);
      }
      
      offset += batchSize;
    }
    
    await connection.end();
    log(`✅ Completed migration for ${tableName}: ${migratedCount} records`);
    
  } catch (error) {
    log(`❌ Error migrating ${tableName}: ${error.message}`);
    throw error;
  }
}

// Transform functions for data compatibility
function transformUser(user) {
  return {
    id: user.id,
    name: user.name || user.full_name,
    email: user.email,
    phone: user.phone,
    employee_id: user.employee_id,
    department: user.department,
    role: user.role || 'employee',
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function transformDashboardUser(user) {
  return {
    id: user.id,
    name: user.name || user.full_name,
    email: user.email,
    password: user.password, // Make sure passwords are hashed
    role: user.role,
    phone: user.phone,
    department: user.department,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function transformIssue(issue) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority || 'medium',
    status: issue.status || 'open',
    employee_id: issue.employee_id || issue.created_by,
    assigned_to: issue.assigned_to,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
}

function transformComment(comment) {
  return {
    id: comment.id,
    issue_id: comment.issue_id,
    author_id: comment.author_id || comment.created_by,
    content: comment.content || comment.message,
    created_at: comment.created_at
  };
}

function transformFeedback(feedback) {
  return {
    id: feedback.id,
    issue_id: feedback.issue_id,
    employee_id: feedback.employee_id || feedback.created_by,
    rating: feedback.rating,
    feedback_text: feedback.feedback_text || feedback.comment,
    resolution_satisfaction: feedback.resolution_satisfaction,
    created_at: feedback.created_at
  };
}

async function main() {
  try {
    log('🚀 Starting Supabase to MySQL migration...');
    
    // Test connections
    log('Testing Supabase connection...');
    const { data: testData } = await supabase.from('users').select('count').limit(1);
    log('✅ Supabase connection successful');
    
    log('Testing MySQL connection...');
    const connection = await mysql.createConnection(mysqlConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    log('✅ MySQL connection successful');
    
    // Migrate tables in dependency order
    await migrateTable('Users', 'users', 'users', transformUser);
    await migrateTable('Dashboard Users', 'dashboard_users', 'dashboard_users', transformDashboardUser);
    await migrateTable('Issues', 'issues', 'issues', transformIssue);
    await migrateTable('Comments', 'issue_comments', 'issue_comments', transformComment);
    await migrateTable('Feedback', 'feedback', 'feedback', transformFeedback);
    
    log('🎉 Migration completed successfully!');
    
  } catch (error) {
    log(`💥 Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { main, migrateTable };
