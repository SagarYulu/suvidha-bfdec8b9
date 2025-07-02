
const mysql = require('mysql2/promise');

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Yulu@123',
  database: process.env.DB_NAME || 'yulu_suvidha',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false
};

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}`);
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    console.error('💡 Please ensure MySQL is running and credentials are correct');
    console.error(`   Database: ${dbConfig.database}`);
    console.error(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.error(`   User: ${dbConfig.user}`);
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
