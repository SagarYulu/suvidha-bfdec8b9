
const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const runMigration = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
