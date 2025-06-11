
-- Initialize yulu_suvidha database with all required tables for complete feature parity
CREATE DATABASE IF NOT EXISTS yulu_suvidha;
USE yulu_suvidha;

-- Dashboard Users table (Admin/Manager users)
CREATE TABLE IF NOT EXISTS dashboard_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role ENUM('admin', 'manager', 'agent', 'employee') DEFAULT 'employee',
  city VARCHAR(100),
  cluster VARCHAR(100),
  phone VARCHAR(20),
  employee_id VARCHAR(50),
  cluster_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table (Enhanced with all fields from root src)
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  emp_name VARCHAR(255) NOT NULL,
  emp_email VARCHAR(255) UNIQUE NOT NULL,
  emp_mobile VARCHAR(20),
  emp_code VARCHAR(50) UNIQUE NOT NULL,
  cluster_id VARCHAR(36),
  role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
  date_of_joining DATE,
  date_of_birth DATE,
  blood_group VARCHAR(10),
  account_number VARCHAR(30),
  ifsc_code VARCHAR(15),
  manager VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Issues table (Complete feature set)
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

-- Comments table (Enhanced)
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES dashboard_users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES dashboard_users(id)
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES dashboard_users(id)
);

-- Issue audit trail
CREATE TABLE IF NOT EXISTS issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES dashboard_users(id)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO dashboard_users (id, full_name, email, password_hash, role) 
VALUES (
  'admin-001', 
  'Admin User', 
  'admin@yulu.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5QJ5J5J5J5', 
  'admin'
);

-- Insert sample employees for testing
INSERT IGNORE INTO employees (id, emp_name, emp_email, emp_code, city, cluster) 
VALUES 
  ('emp-001', 'John Doe', 'john.doe@yulu.com', 'YUL001', 'Bangalore', 'South'),
  ('emp-002', 'Jane Smith', 'jane.smith@yulu.com', 'YUL002', 'Mumbai', 'West'),
  ('emp-003', 'Bob Wilson', 'bob.wilson@yulu.com', 'YUL003', 'Delhi', 'North');

-- Insert sample issues for testing
INSERT IGNORE INTO issues (id, title, description, issue_type, issue_subtype, priority, employee_id, created_by) 
VALUES 
  ('issue-001', 'Login Issue', 'Cannot access account', 'Technical', 'Authentication', 'medium', 'emp-001', 'admin-001'),
  ('issue-002', 'Salary Query', 'Salary not credited', 'HR', 'Payroll', 'high', 'emp-002', 'admin-001');
