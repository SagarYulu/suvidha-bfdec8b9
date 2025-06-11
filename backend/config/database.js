
const mysql = require('mysql2/promise');

let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'yulu_suvidha',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000
    });
  }
  return pool;
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

const connectDB = async () => {
  try {
    const connection = await getPool().getConnection();
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  getPool,
  createPool
};
