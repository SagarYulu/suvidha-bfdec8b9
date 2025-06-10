
-- Complete Windsurf Grievance Portal MySQL Schema
-- This includes all tables and data from the original project

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS issue_activities;
DROP TABLE IF EXISTS issue_internal_comments;
DROP TABLE IF EXISTS issue_comments;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS rbac_user_roles;
DROP TABLE IF EXISTS rbac_role_permissions;
DROP TABLE IF EXISTS rbac_permissions;
DROP TABLE IF EXISTS rbac_roles;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS dashboard_users;
DROP TABLE IF EXISTS users;

-- Users table (employees)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  manager VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department)
);

-- Dashboard users table (admin users)
CREATE TABLE dashboard_users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Issues table
CREATE TABLE issues (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  employee_id VARCHAR(36),
  assigned_to VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_category (category),
  INDEX idx_employee_id (employee_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_created_at (created_at)
);

-- Issue comments table
CREATE TABLE issue_comments (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id),
  INDEX idx_author_id (author_id),
  INDEX idx_created_at (created_at)
);

-- Internal comments table (admin only)
CREATE TABLE issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id),
  INDEX idx_author_id (author_id)
);

-- Feedback table
CREATE TABLE feedback (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  resolution_satisfaction ENUM('very_unsatisfied', 'unsatisfied', 'neutral', 'satisfied', 'very_satisfied'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_rating (rating)
);

-- File attachments table
CREATE TABLE attachments (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id)
);

-- RBAC Tables
CREATE TABLE rbac_roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rbac_permissions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rbac_role_permissions (
  role_id VARCHAR(36),
  permission_id VARCHAR(36),
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE
);

CREATE TABLE rbac_user_roles (
  user_id VARCHAR(36),
  role_id VARCHAR(36),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
);

-- Issue activities/audit log
CREATE TABLE issue_activities (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  actor_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id),
  INDEX idx_actor_id (actor_id),
  INDEX idx_created_at (created_at)
);

-- Insert sample data
-- Sample users (employees)
INSERT INTO users (id, name, email, phone, employee_id, department, manager, city, cluster) VALUES
('emp-001', 'John Doe', 'john.doe@company.com', '+1234567890', 'EMP001', 'Engineering', 'Jane Manager', 'New York', 'North'),
('emp-002', 'Jane Smith', 'jane.smith@company.com', '+1234567891', 'EMP002', 'Marketing', 'Bob Director', 'Los Angeles', 'West'),
('emp-003', 'Bob Wilson', 'bob.wilson@company.com', '+1234567892', 'EMP003', 'Sales', 'Alice VP', 'Chicago', 'Central'),
('emp-004', 'Alice Brown', 'alice.brown@company.com', '+1234567893', 'EMP004', 'HR', 'Tom Manager', 'Houston', 'South');

-- Sample dashboard users (admin)
INSERT INTO dashboard_users (id, name, email, password, role, department) VALUES
('admin-001', 'Super Admin', 'admin@company.com', '$2b$10$hash1', 'Super Admin', 'IT'),
('admin-002', 'HR Admin', 'hr.admin@company.com', '$2b$10$hash2', 'Admin', 'HR'),
('admin-003', 'Manager User', 'manager@company.com', '$2b$10$hash3', 'Manager', 'Operations');

-- Sample RBAC roles
INSERT INTO rbac_roles (id, name, description) VALUES
('role-1', 'Super Admin', 'Full system access'),
('role-2', 'Admin', 'Administrative access'),
('role-3', 'Manager', 'Management level access'),
('role-4', 'Agent', 'Issue handling access');

-- Sample RBAC permissions
INSERT INTO rbac_permissions (id, name, description) VALUES
('perm-1', 'manage:issues', 'Manage issues'),
('perm-2', 'manage:users', 'Manage users'),
('perm-3', 'view:analytics', 'View analytics'),
('perm-4', 'manage:settings', 'Manage settings');

-- Assign permissions to roles
INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES
('role-1', 'perm-1'), ('role-1', 'perm-2'), ('role-1', 'perm-3'), ('role-1', 'perm-4'),
('role-2', 'perm-1'), ('role-2', 'perm-3'),
('role-3', 'perm-1'), ('role-3', 'perm-3');

-- Assign roles to users
INSERT INTO rbac_user_roles (user_id, role_id) VALUES
('admin-001', 'role-1'),
('admin-002', 'role-2'),
('admin-003', 'role-3');

-- Sample issues
INSERT INTO issues (id, title, description, category, priority, status, employee_id, assigned_to) VALUES
('issue-001', 'Login System Error', 'Unable to login to the company portal', 'Technical', 'high', 'open', 'emp-001', 'admin-001'),
('issue-002', 'Payroll Discrepancy', 'Salary calculation appears incorrect', 'Payroll', 'medium', 'in_progress', 'emp-002', 'admin-002'),
('issue-003', 'Office Equipment Request', 'Need new laptop for work', 'Equipment', 'low', 'resolved', 'emp-003', 'admin-003'),
('issue-004', 'Network Connectivity Issue', 'Internet connection dropping frequently', 'Technical', 'high', 'open', 'emp-004', 'admin-001');

-- Sample comments
INSERT INTO issue_comments (id, issue_id, author_id, content) VALUES
('comment-001', 'issue-001', 'admin-001', 'Investigating the login issue. Will update soon.'),
('comment-002', 'issue-002', 'admin-002', 'Reviewed payroll data, found calculation error.'),
('comment-003', 'issue-003', 'admin-003', 'Laptop approved and ordered.');

-- Sample activities
INSERT INTO issue_activities (id, issue_id, actor_id, action, old_value, new_value) VALUES
('activity-001', 'issue-001', 'admin-001', 'status_change', 'open', 'in_progress'),
('activity-002', 'issue-002', 'admin-002', 'assigned', NULL, 'admin-002'),
('activity-003', 'issue-003', 'admin-003', 'status_change', 'in_progress', 'resolved');
