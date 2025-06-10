
const mysql = require('mysql2/promise');

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
};

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB() first.');
  }
  return pool;
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    console.log('🔒 MySQL Connection Closed');
  }
};

module.exports = {
  connectDB,
  getPool,
  closeDB
};
