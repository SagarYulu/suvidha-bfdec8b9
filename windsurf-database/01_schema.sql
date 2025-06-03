
-- MySQL Database Schema for Yulu Grievance Portal
-- Execute this script to create all tables and indexes

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- ========================================
-- CREATE TABLES
-- ========================================

-- Table: employees
CREATE TABLE employees (
  employee_uuid VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL DEFAULT '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O',
  manager_name VARCHAR(255),
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

-- Table: dashboard_users
CREATE TABLE dashboard_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(50),
  phone VARCHAR(20),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager_name VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  last_updated_by VARCHAR(36)
);

-- Table: issues
CREATE TABLE issues (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_uuid VARCHAR(36) NOT NULL,
  type_id VARCHAR(50) NOT NULL,
  sub_type_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  assigned_to VARCHAR(36),
  mapped_type_id VARCHAR(50),
  mapped_sub_type_id VARCHAR(50),
  mapped_by VARCHAR(36),
  mapped_at TIMESTAMP NULL,
  attachments JSON,
  attachment_url TEXT,
  INDEX idx_employee_uuid (employee_uuid),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_assigned_to (assigned_to)
);

-- Table: issue_comments
CREATE TABLE issue_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36),
  admin_user_id VARCHAR(36),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_issue_id (issue_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Table: issue_internal_comments
CREATE TABLE issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issue_id (issue_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Table: issue_audit_trail
CREATE TABLE issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_issue_id (issue_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Table: issue_notifications
CREATE TABLE issue_notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_issue_id (issue_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Table: ticket_feedback
CREATE TABLE ticket_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  feedback_option VARCHAR(100) NOT NULL,
  cluster VARCHAR(100),
  city VARCHAR(100),
  agent_id VARCHAR(36),
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_issue_id (issue_id),
  INDEX idx_sentiment (sentiment),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Master data tables
CREATE TABLE master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  city_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE
);

-- RBAC Tables
CREATE TABLE rbac_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rbac_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rbac_role_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

CREATE TABLE rbac_user_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Audit tables
CREATE TABLE dashboard_user_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  performed_by VARCHAR(36),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for performance
CREATE INDEX idx_employees_email ON employees(employee_email);
CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_ticket_feedback_sentiment ON ticket_feedback(sentiment);

SET FOREIGN_KEY_CHECKS = 1;
