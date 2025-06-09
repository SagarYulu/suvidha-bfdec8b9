
const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grievance_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.execute('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your database configuration in .env file');
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = {
  pool: pool.promise(),
  poolSync: pool
};
