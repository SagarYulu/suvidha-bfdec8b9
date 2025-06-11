
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS yulu_suvidha;
USE yulu_suvidha;

-- Drop existing tables to ensure clean setup
DROP TABLE IF EXISTS issue_audit_trail;
DROP TABLE IF EXISTS issue_comments;
DROP TABLE IF EXISTS ticket_feedback;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS dashboard_users;
DROP TABLE IF EXISTS master_clusters;
DROP TABLE IF EXISTS master_cities;

-- Create master_cities table
CREATE TABLE master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  city_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create master_clusters table
CREATE TABLE master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  cluster_name VARCHAR(100) NOT NULL,
  city_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES master_cities(id)
);

-- Create dashboard_users table
CREATE TABLE dashboard_users (
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

-- Create employees table
CREATE TABLE employees (
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

-- Create issues table
CREATE TABLE issues (
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

-- Create issue_comments table
CREATE TABLE issue_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES dashboard_users(id)
);

-- Create issue_audit_trail table
CREATE TABLE issue_audit_trail (
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

-- Create ticket_feedback table
CREATE TABLE ticket_feedback (
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

-- Insert sample data for testing
-- Cities
INSERT INTO master_cities (id, city_name) VALUES 
('city-1', 'Bangalore'),
('city-2', 'Mumbai'),
('city-3', 'Delhi'),
('city-4', 'Pune');

-- Clusters
INSERT INTO master_clusters (id, cluster_name, city_id) VALUES 
('cluster-1', 'North Bangalore', 'city-1'),
('cluster-2', 'South Bangalore', 'city-1'),
('cluster-3', 'Andheri', 'city-2'),
('cluster-4', 'Bandra', 'city-2');

-- Admin user (password: admin123)
INSERT INTO dashboard_users (id, full_name, email, password_hash, role) VALUES 
('admin-1', 'Admin User', 'admin@yulu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGG.pR9OB6O6Zke', 'admin');

-- Sample employees
INSERT INTO employees (id, emp_name, emp_email, emp_code, cluster_id, password) VALUES 
('emp-1', 'John Doe', 'john@yulu.com', 'EMP001', 'cluster-1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGG.pR9OB6O6Zke'),
('emp-2', 'Jane Smith', 'jane@yulu.com', 'EMP002', 'cluster-2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGG.pR9OB6O6Zke');

-- Sample issues
INSERT INTO issues (id, title, description, issue_type, issue_subtype, priority, employee_id, created_by) VALUES 
('issue-1', 'Payroll Issue', 'My salary was not credited this month', 'hr', 'payroll', 'high', 'emp-1', 'admin-1'),
('issue-2', 'System Access Problem', 'Cannot login to company portal', 'tech', 'access', 'medium', 'emp-2', 'admin-1');
