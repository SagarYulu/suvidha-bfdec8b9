
const mysql = require('mysql2/promise');

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'yulu_suvidha',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      multipleStatements: true
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully to', process.env.DB_NAME || 'yulu_suvidha');
    
    // Initialize database schema if needed
    await initializeSchema(connection);
    connection.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB() first.');
  }
  return pool;
};

const initializeSchema = async (connection) => {
  try {
    // Create tables if they don't exist - matching the structure expected by both frontend and backend
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS dashboard_users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'agent', 'employee') NOT NULL DEFAULT 'employee',
        city VARCHAR(100),
        cluster VARCHAR(100),
        phone VARCHAR(20),
        employee_id VARCHAR(50),
        cluster_id VARCHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS master_cities (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        city_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS master_clusters (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        cluster_name VARCHAR(100) NOT NULL,
        city_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES master_cities(id)
      );

      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        emp_name VARCHAR(255) NOT NULL,
        emp_email VARCHAR(255) UNIQUE NOT NULL,
        emp_mobile VARCHAR(20),
        emp_code VARCHAR(50) UNIQUE NOT NULL,
        cluster_id VARCHAR(36),
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
        date_of_joining DATE,
        date_of_birth DATE,
        blood_group VARCHAR(10),
        account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        manager VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cluster_id) REFERENCES master_clusters(id)
      );

      CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255),
        description TEXT NOT NULL,
        issue_type VARCHAR(50) NOT NULL,
        issue_subtype VARCHAR(50) NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed', 'pending', 'escalated') DEFAULT 'open',
        employee_id VARCHAR(36) NOT NULL,
        created_by VARCHAR(36) NOT NULL,
        assigned_to VARCHAR(36),
        resolved_at TIMESTAMP NULL,
        additional_details JSON,
        attachment_urls JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (created_by) REFERENCES dashboard_users(id),
        FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id)
      );

      CREATE TABLE IF NOT EXISTS issue_comments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        issue_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES dashboard_users(id)
      );

      CREATE TABLE IF NOT EXISTS issue_audit_trail (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        issue_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES dashboard_users(id)
      );

      CREATE TABLE IF NOT EXISTS ticket_feedback (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        issue_id VARCHAR(36) NOT NULL,
        employee_uuid VARCHAR(36) NOT NULL,
        sentiment ENUM('happy', 'neutral', 'sad') NOT NULL,
        feedback_option VARCHAR(255) NOT NULL,
        agent_id VARCHAR(36),
        agent_name VARCHAR(255),
        city VARCHAR(100),
        cluster VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id),
        FOREIGN KEY (employee_uuid) REFERENCES employees(id)
      );
    `;

    await connection.query(createTablesSQL);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    throw error;
  }
};

module.exports = { connectDB, getPool };
