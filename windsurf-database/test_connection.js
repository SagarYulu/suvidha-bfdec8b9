
const mysql = require('mysql2/promise');
require('dotenv').config();

const testDatabaseConnection = async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'grievance_user',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'grievance_portal',
    charset: 'utf8mb4'
  };

  try {
    console.log('🔄 Testing database connection...');
    console.log(`📍 Connecting to: ${config.host}:${config.port}/${config.database}`);
    
    const connection = await mysql.createConnection(config);
    
    // Test basic connectivity
    await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check schema
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [config.database]);
    
    console.log(`📊 Found ${tables[0].table_count} tables in database`);
    
    // Check for key tables
    const [keyTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name IN ('employees', 'issues', 'dashboard_users')
      ORDER BY table_name
    `, [config.database]);
    
    if (keyTables.length === 3) {
      console.log('✅ Core tables found: employees, issues, dashboard_users');
    } else {
      console.log('⚠️  Some core tables missing. Please run schema installation.');
    }
    
    // Check sample data
    const [sampleData] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM master_cities) as cities,
        (SELECT COUNT(*) FROM master_issue_types) as issue_types,
        (SELECT COUNT(*) FROM rbac_roles) as roles
    `);
    
    console.log(`📋 Sample data: ${sampleData[0].cities} cities, ${sampleData[0].issue_types} issue types, ${sampleData[0].roles} roles`);
    
    await connection.end();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if MySQL is running');
    console.error('2. Verify connection credentials in .env file');
    console.error('3. Ensure database exists and user has proper permissions');
    console.error('4. Run: mysql -u <user> -p <database> < 01_schema.sql');
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };
