
-- Database schema for Grievance Portal

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY,
  emp_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  user_id VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  manager VARCHAR(255),
  role VARCHAR(100),
  cluster VARCHAR(100),
  city VARCHAR(100),
  date_of_joining DATE,
  blood_group VARCHAR(10),
  date_of_birth DATE,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dashboard users table
CREATE TABLE IF NOT EXISTS dashboard_users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(50),
  user_id VARCHAR(50),
  phone VARCHAR(20),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  last_updated_by VARCHAR(36),
  deleted_at TIMESTAMP NULL
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id VARCHAR(36) PRIMARY KEY,
  employee_uuid VARCHAR(36) NOT NULL,
  type_id VARCHAR(50) NOT NULL,
  sub_type_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  assigned_to VARCHAR(36),
  mapped_type_id VARCHAR(50),
  mapped_sub_type_id VARCHAR(50),
  mapped_by VARCHAR(36),
  mapped_at TIMESTAMP NULL,
  attachments JSON,
  attachment_url TEXT
);

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Issue internal comments table
CREATE TABLE IF NOT EXISTS issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Issue audit trail table
CREATE TABLE IF NOT EXISTS issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Ticket feedback table
CREATE TABLE IF NOT EXISTS ticket_feedback (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  feedback_option VARCHAR(100) NOT NULL,
  cluster VARCHAR(100),
  city VARCHAR(100),
  agent_id VARCHAR(36),
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Issue notifications table
CREATE TABLE IF NOT EXISTS issue_notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  issue_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master tables for reference data
CREATE TABLE IF NOT EXISTS master_cities (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_clusters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES master_cities(id)
);

CREATE TABLE IF NOT EXISTS master_roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_issues_employee_uuid ON issues(employee_uuid);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX idx_issue_audit_trail_issue_id ON issue_audit_trail(issue_id);
CREATE INDEX idx_employees_emp_id ON employees(emp_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);
