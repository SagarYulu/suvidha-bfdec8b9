const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.execute(`USE ${process.env.DB_NAME}`);
    
    // Create tables
    await createTables(connection);
    
    connection.release();
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

const createTables = async (connection) => {
  // Drop existing tables if they exist (for clean migration)
  await connection.execute(`DROP TABLE IF EXISTS ticket_feedback`);
  await connection.execute(`DROP TABLE IF EXISTS issue_comments`);
  await connection.execute(`DROP TABLE IF EXISTS issues`);
  await connection.execute(`DROP TABLE IF EXISTS rbac_user_roles`);
  await connection.execute(`DROP TABLE IF EXISTS rbac_role_permissions`);
  await connection.execute(`DROP TABLE IF EXISTS rbac_permissions`);
  await connection.execute(`DROP TABLE IF EXISTS rbac_roles`);
  await connection.execute(`DROP TABLE IF EXISTS master_clusters`);
  await connection.execute(`DROP TABLE IF EXISTS master_cities`);
  await connection.execute(`DROP TABLE IF EXISTS master_roles`);
  await connection.execute(`DROP TABLE IF EXISTS dashboard_users`);
  await connection.execute(`DROP TABLE IF EXISTS employees`);
  await connection.execute(`DROP TABLE IF EXISTS users`);

  // Users table (for authentication)
  await connection.execute(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_role (role)
    )
  `);

  // Employees table
  await connection.execute(`
    CREATE TABLE employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      emp_id VARCHAR(50) UNIQUE NOT NULL,
      city VARCHAR(100),
      cluster VARCHAR(100),
      manager VARCHAR(255),
      role VARCHAR(100),
      password VARCHAR(255),
      date_of_joining DATE,
      blood_group VARCHAR(10),
      date_of_birth DATE,
      account_number VARCHAR(50),
      ifsc_code VARCHAR(20),
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_email (email),
      INDEX idx_emp_id (emp_id),
      INDEX idx_city (city),
      INDEX idx_cluster (cluster)
    )
  `);

  // Dashboard Users table
  await connection.execute(`
    CREATE TABLE dashboard_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      employee_id VARCHAR(50),
      city VARCHAR(100),
      cluster VARCHAR(100),
      manager VARCHAR(255),
      role VARCHAR(100),
      password VARCHAR(255),
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT,
      last_updated_by INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_email (email),
      INDEX idx_role (role)
    )
  `);

  // Issues table
  await connection.execute(`
    CREATE TABLE issues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'open',
      priority VARCHAR(20) DEFAULT 'medium',
      type_id VARCHAR(50),
      sub_type_id VARCHAR(50),
      employee_id INT NOT NULL,
      assigned_to INT,
      attachment_url TEXT,
      attachments JSON,
      mapped_type_id VARCHAR(50),
      mapped_sub_type_id VARCHAR(50),
      mapped_by INT,
      mapped_at TIMESTAMP NULL,
      closed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL,
      FOREIGN KEY (mapped_by) REFERENCES dashboard_users(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_employee_id (employee_id),
      INDEX idx_assigned_to (assigned_to)
    )
  `);

  // Issue Comments table
  await connection.execute(`
    CREATE TABLE issue_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      issue_id INT NOT NULL,
      content TEXT NOT NULL,
      employee_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      INDEX idx_issue_id (issue_id),
      INDEX idx_employee_id (employee_id)
    )
  `);

  // Ticket Feedback table
  await connection.execute(`
    CREATE TABLE ticket_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      issue_id INT NOT NULL,
      feedback TEXT NOT NULL,
      sentiment VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      INDEX idx_issue_id (issue_id),
      INDEX idx_sentiment (sentiment)
    )
  `);

  // RBAC Tables
  await connection.execute(`
    CREATE TABLE rbac_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    )
  `);

  await connection.execute(`
    CREATE TABLE rbac_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    )
  `);

  await connection.execute(`
    CREATE TABLE rbac_role_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
      UNIQUE KEY unique_role_permission (role_id, permission_id)
    )
  `);

  await connection.execute(`
    CREATE TABLE rbac_user_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_role (user_id, role_id)
    )
  `);

  // Master Data Tables
  await connection.execute(`
    CREATE TABLE master_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    )
  `);

  await connection.execute(`
    CREATE TABLE master_cities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      state VARCHAR(100),
      country VARCHAR(100) DEFAULT 'India',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    )
  `);

  await connection.execute(`
    CREATE TABLE master_clusters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      city_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE,
      INDEX idx_name (name),
      INDEX idx_city_id (city_id)
    )
  `);
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};