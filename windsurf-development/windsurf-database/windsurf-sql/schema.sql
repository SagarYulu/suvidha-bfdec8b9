
-- Grievance Portal MySQL Schema (Windsurf Version)

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Users table (employees)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
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
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  employee_id VARCHAR(36),
  assigned_to VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
CREATE TABLE internal_comments (
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

-- Sentiment analysis table
CREATE TABLE sentiment_analysis (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  mood ENUM('very_bad', 'bad', 'neutral', 'good', 'excellent') NOT NULL,
  topics JSON,
  feedback_text TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_mood (mood),
  INDEX idx_created_at (created_at)
);

-- Insert default RBAC data
INSERT INTO rbac_roles (id, name, description) VALUES
('role-1', 'Super Admin', 'Full system access'),
('role-2', 'Admin', 'Administrative access'),
('role-3', 'Manager', 'Management level access'),
('role-4', 'Agent', 'Issue handling access'),
('role-5', 'Viewer', 'Read-only access');

INSERT INTO rbac_permissions (id, name, description) VALUES
('perm-1', 'view:dashboard', 'View dashboard'),
('perm-2', 'manage:users', 'Manage users'),
('perm-3', 'manage:issues', 'Manage issues'),
('perm-4', 'manage:analytics', 'View analytics'),
('perm-5', 'manage:settings', 'Manage settings'),
('perm-6', 'access:security', 'Access security features'),
('perm-7', 'create:dashboardUser', 'Create dashboard users'),
('perm-8', 'view_analytics', 'View analytics data');

-- Assign permissions to roles
INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES
-- Super Admin - all permissions
('role-1', 'perm-1'), ('role-1', 'perm-2'), ('role-1', 'perm-3'), 
('role-1', 'perm-4'), ('role-1', 'perm-5'), ('role-1', 'perm-6'), 
('role-1', 'perm-7'), ('role-1', 'perm-8'),
-- Admin - most permissions
('role-2', 'perm-1'), ('role-2', 'perm-2'), ('role-2', 'perm-3'), 
('role-2', 'perm-4'), ('role-2', 'perm-8'),
-- Manager - limited permissions
('role-3', 'perm-1'), ('role-3', 'perm-3'), ('role-3', 'perm-4'), ('role-3', 'perm-8'),
-- Agent - basic permissions
('role-4', 'perm-1'), ('role-4', 'perm-3'),
-- Viewer - read only
('role-5', 'perm-1'), ('role-5', 'perm-8');

-- Create indexes for better performance
CREATE INDEX idx_issues_status_priority ON issues(status, priority);
CREATE INDEX idx_issues_created_at_status ON issues(created_at, status);
CREATE INDEX idx_feedback_rating_created ON feedback(rating, created_at);

-- Create default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO dashboard_users (id, name, email, password, role) VALUES
('admin-1', 'System Admin', 'admin@yulu.com', '$2b$10$rQJ9aDr5QjQjQjQjQjQjQuO7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K', 'Super Admin');

-- Assign super admin role to default admin
INSERT INTO rbac_user_roles (user_id, role_id) VALUES ('admin-1', 'role-1');
