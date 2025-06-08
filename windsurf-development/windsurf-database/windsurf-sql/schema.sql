
-- Database schema for Windsurf Development (MySQL)
-- This matches the original Supabase schema structure

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Employees table (matches Supabase employees structure)
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  emp_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  user_id VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  date_of_birth DATE,
  date_of_joining DATE,
  blood_group VARCHAR(10),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employees_emp_id (emp_id),
  INDEX idx_employees_email (email),
  INDEX idx_employees_city (city),
  INDEX idx_employees_cluster (cluster),
  INDEX idx_employees_role (role)
);

-- Dashboard users table (for admin panel users)
CREATE TABLE IF NOT EXISTS dashboard_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(50),
  user_id VARCHAR(50),
  phone VARCHAR(20),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  last_updated_by VARCHAR(36),
  INDEX idx_dashboard_users_email (email),
  INDEX idx_dashboard_users_role (role),
  INDEX idx_dashboard_users_employee_id (employee_id)
);

-- Issues table (core table for ticket management)
CREATE TABLE IF NOT EXISTS issues (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_uuid VARCHAR(36) NOT NULL,
  type_id VARCHAR(50) NOT NULL,
  sub_type_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'low',
  assigned_to VARCHAR(36),
  attachment_url TEXT,
  attachments JSON,
  mapped_type_id VARCHAR(50),
  mapped_sub_type_id VARCHAR(50),
  mapped_by VARCHAR(36),
  mapped_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  INDEX idx_issues_employee (employee_uuid),
  INDEX idx_issues_status (status),
  INDEX idx_issues_priority (priority),
  INDEX idx_issues_assigned_to (assigned_to),
  INDEX idx_issues_created_at (created_at),
  INDEX idx_issues_type (type_id),
  INDEX idx_issues_sub_type (sub_type_id),
  FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE
);

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comments_issue (issue_id),
  INDEX idx_comments_employee (employee_uuid),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE
);

-- Internal comments table (for admin/agent internal notes)
CREATE TABLE IF NOT EXISTS issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_internal_comments_issue (issue_id),
  INDEX idx_internal_comments_employee (employee_uuid),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Issue audit trail table (tracks all changes)
CREATE TABLE IF NOT EXISTS issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_issue (issue_id),
  INDEX idx_audit_employee (employee_uuid),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created_at (created_at),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Ticket feedback table (emoji-based feedback)
CREATE TABLE IF NOT EXISTS ticket_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  feedback_option VARCHAR(10) NOT NULL, -- 😊, 😐, 😞
  sentiment VARCHAR(20) NOT NULL, -- positive, neutral, negative
  agent_id VARCHAR(36),
  agent_name VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_issue (issue_id),
  INDEX idx_feedback_employee (employee_uuid),
  INDEX idx_feedback_sentiment (sentiment),
  INDEX idx_feedback_created_at (created_at),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE
);

-- File attachments table (for S3 file tracking)
CREATE TABLE IF NOT EXISTS file_attachments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'attachments',
  uploaded_by VARCHAR(36) NOT NULL,
  issue_id VARCHAR(36),
  s3_key VARCHAR(500),
  s3_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attachments_uploaded_by (uploaded_by),
  INDEX idx_attachments_issue (issue_id),
  INDEX idx_attachments_category (category),
  FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE SET NULL
);

-- Issue notifications table
CREATE TABLE IF NOT EXISTS issue_notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_issue (issue_id),
  INDEX idx_notifications_read (is_read),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Master data tables

-- Master cities table
CREATE TABLE IF NOT EXISTS master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Master clusters table
CREATE TABLE IF NOT EXISTS master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  city_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE
);

-- Master roles table
CREATE TABLE IF NOT EXISTS master_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RBAC tables

-- RBAC roles table
CREATE TABLE IF NOT EXISTS rbac_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RBAC permissions table
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RBAC role permissions table
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE
);

-- RBAC user roles table
CREATE TABLE IF NOT EXISTS rbac_user_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_role (user_id, role_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
);

-- Audit logs tables

-- Dashboard user audit logs
CREATE TABLE IF NOT EXISTS dashboard_user_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  performed_by VARCHAR(36),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_entity (entity_type, entity_id),
  INDEX idx_audit_logs_performed_by (performed_by),
  INDEX idx_audit_logs_performed_at (performed_at)
);

-- Master audit logs
CREATE TABLE IF NOT EXISTS master_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_master_audit_entity (entity_type, entity_id),
  INDEX idx_master_audit_created_by (created_by),
  INDEX idx_master_audit_created_at (created_at)
);

-- Insert default data

-- Insert default cities
INSERT IGNORE INTO master_cities (name) VALUES 
('Bangalore'), ('Delhi'), ('Mumbai'), ('Chennai'), ('Hyderabad'), ('Pune');

-- Insert default roles
INSERT IGNORE INTO master_roles (name) VALUES 
('Admin'), ('Manager'), ('Agent'), ('Recruiter'), ('CRM'), ('Trainer'), ('Employee');

-- Insert RBAC roles
INSERT IGNORE INTO rbac_roles (name, description) VALUES 
('admin', 'System Administrator with full access'),
('manager', 'Team Manager with supervisory access'),
('agent', 'Support Agent with issue management access'),
('recruiter', 'Recruiter with employee management access'),
('crm', 'CRM with customer relationship access'),
('trainer', 'Trainer with training content access'),
('employee', 'Regular employee with basic access');

-- Insert RBAC permissions
INSERT IGNORE INTO rbac_permissions (name, description) VALUES 
('issues:create', 'Create new issues'),
('issues:read', 'View issues'),
('issues:update', 'Update existing issues'),
('issues:delete', 'Delete issues'),
('issues:assign', 'Assign issues to agents'),
('issues:comment', 'Add comments to issues'),
('users:create', 'Create new users'),
('users:read', 'View user information'),
('users:update', 'Update user information'),
('users:delete', 'Delete users'),
('reports:read', 'View reports and analytics'),
('feedback:read', 'View feedback'),
('feedback:create', 'Submit feedback'),
('admin:all', 'Full administrative access');

-- Create default admin user (password should be hashed in production)
INSERT IGNORE INTO dashboard_users (id, name, email, role, password) VALUES 
('admin-uuid-1', 'System Admin', 'admin@company.com', 'admin', '$2b$10$dummyhashedpassword');

-- Set up foreign key relationships properly
ALTER TABLE issues ADD CONSTRAINT fk_issues_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL;

ALTER TABLE issue_audit_trail ADD CONSTRAINT fk_audit_employee 
  FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE;
