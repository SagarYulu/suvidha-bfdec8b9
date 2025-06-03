
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://tnesowutsnxrhqrashok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZXNvd3V0c254cmhxcmFzaG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NzQyNTEsImV4cCI6MjA2MTE1MDI1MX0.F7FVti5RTVlzEhXq57R4CiKsA6qqoybS4HvLynQx4ww';

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to export (in dependency order)
const TABLES_TO_EXPORT = [
  'master_cities',
  'master_clusters', 
  'master_roles',
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

// Function to escape SQL values
function escapeValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  
  if (Array.isArray(value) || typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  
  return value;
}

// Function to generate INSERT statement
function generateInsertStatement(tableName, data) {
  if (!data || data.length === 0) {
    return `-- No data found for table: ${tableName}\n`;
  }

  const columns = Object.keys(data[0]);
  let sql = `-- Inserting data into ${tableName}\n`;
  sql += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n`;
  
  const values = data.map(row => {
    const rowValues = columns.map(col => escapeValue(row[col]));
    return `  (${rowValues.join(', ')})`;
  });
  
  sql += values.join(',\n');
  sql += ';\n\n';
  
  return sql;
}

// Function to export data from a table
async function exportTableData(tableName) {
  console.log(`Exporting data from ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      return `-- Error fetching data from ${tableName}: ${error.message}\n`;
    }
    
    console.log(`Found ${data?.length || 0} records in ${tableName}`);
    return generateInsertStatement(tableName, data);
  } catch (err) {
    console.error(`Exception while exporting ${tableName}:`, err);
    return `-- Exception while exporting ${tableName}: ${err.message}\n`;
  }
}

// Main export function
async function exportAllData() {
  console.log('Starting data export from Supabase...');
  
  let sqlContent = `-- MySQL Data Export from Supabase
-- Generated on ${new Date().toISOString()}
-- Database: Yulu Grievance Portal
-- 
-- Instructions:
-- 1. First run the schema.sql file to create all tables
-- 2. Then run this file to import all your existing data
-- 3. Update your application configuration to use MySQL instead of Supabase

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

`;

  // Export each table
  for (const tableName of TABLES_TO_EXPORT) {
    const tableData = await exportTableData(tableName);
    sqlContent += tableData;
  }

  sqlContent += `
SET FOREIGN_KEY_CHECKS = 1;

-- Data export completed successfully!
-- Total tables exported: ${TABLES_TO_EXPORT.length}
-- 
-- Next steps:
-- 1. Import this file into your MySQL database
-- 2. Update your backend configuration to use MySQL
-- 3. Test your application functionality
-- 4. You can now run independently without Supabase!
`;

  // Write to file
  const outputFile = path.join(__dirname, '02_actual_data.sql');
  fs.writeFileSync(outputFile, sqlContent, 'utf8');
  
  console.log(`\nData export completed!`);
  console.log(`Output file: ${outputFile}`);
  console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
  
  return outputFile;
}

// Export statistics function
async function generateExportStats() {
  console.log('\nGenerating export statistics...');
  
  const stats = [];
  for (const tableName of TABLES_TO_EXPORT) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        stats.push({ table: tableName, count: count || 0 });
      }
    } catch (err) {
      stats.push({ table: tableName, count: 'Error' });
    }
  }
  
  console.log('\n📊 Export Statistics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  stats.forEach(({ table, count }) => {
    console.log(`${table.padEnd(25)} | ${count.toString().padStart(8)} records`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return stats;
}

// Run the export
async function main() {
  try {
    await generateExportStats();
    await exportAllData();
    
    console.log('\n✅ Export completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: mysql -u root -p grievance_portal < windsurf-database/01_schema.sql');
    console.log('2. Run: mysql -u root -p grievance_portal < windsurf-database/02_actual_data.sql');
    console.log('3. Update your backend .env to use MySQL connection');
    console.log('4. Test your application');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  exportAllData,
  generateExportStats,
  exportTableData
};
