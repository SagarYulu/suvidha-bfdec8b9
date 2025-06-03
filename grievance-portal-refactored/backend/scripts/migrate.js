
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'grievance_user',
  password: process.env.DB_PASSWORD || 'grievance_password',
  database: process.env.DB_NAME || 'grievance_portal',
  multipleStatements: true
};

async function runMigration() {
  const connection = mysql.createConnection(dbConfig);

  try {
    console.log('Connecting to database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running database schema...');
    connection.query(schema, (err, results) => {
      if (err) {
        console.error('Error running schema:', err);
        process.exit(1);
      }
      
      console.log('Database schema created successfully!');
      connection.end();
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
