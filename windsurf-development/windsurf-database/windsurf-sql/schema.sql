
-- Grievance Portal MySQL Schema (Windsurf Version)

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Master Cities Table
CREATE TABLE master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Clusters Table
CREATE TABLE master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  city_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city_id (city_id),
  INDEX idx_name (name),
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cluster_per_city (city_id, name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Roles Table
CREATE TABLE master_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Audit Logs Table
CREATE TABLE master_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- Dashboard User Audit Logs Table
CREATE TABLE dashboard_user_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON,
  performed_by VARCHAR(36),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_performed_by (performed_by),
  INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- Insert default master data
INSERT INTO master_cities (id, name) VALUES 
('city-1', 'Bangalore'),
('city-2', 'Mumbai'), 
('city-3', 'Delhi'),
('city-4', 'Chennai'),
('city-5', 'Hyderabad'),
('city-6', 'Pune'),
('city-7', 'Kolkata');

INSERT INTO master_clusters (id, city_id, name) VALUES
('cluster-1', 'city-1', 'North Bangalore'),
('cluster-2', 'city-1', 'South Bangalore'),
('cluster-3', 'city-2', 'Central Mumbai'),
('cluster-4', 'city-2', 'Suburban Mumbai'),
('cluster-5', 'city-3', 'Central Delhi'),
('cluster-6', 'city-3', 'South Delhi');

INSERT INTO master_roles (id, name) VALUES
('role-1', 'admin'),
('role-2', 'security-admin'),
('role-3', 'employee'),
('role-4', 'City Head'),
('role-5', 'Cluster Head'),
('role-6', 'HR Admin');

-- Insert RBAC permissions
INSERT INTO rbac_permissions (id, name, description) VALUES
('perm-1', 'manage:issues', 'Can manage all issues'),
('perm-2', 'view:issues', 'Can view issues'),
('perm-3', 'create:issues', 'Can create issues'),
('perm-4', 'manage:users', 'Can manage users'),
('perm-5', 'view:analytics', 'Can view analytics'),
('perm-6', 'manage:analytics', 'Can manage analytics'),
('perm-7', 'manage:feedback', 'Can manage feedback'),
('perm-8', 'view:feedback', 'Can view feedback');

-- Insert RBAC roles
INSERT INTO rbac_roles (id, name, description) VALUES
('rbac-role-1', 'Admin', 'Full system access'),
('rbac-role-2', 'Security Admin', 'Security and user management'),
('rbac-role-3', 'Employee', 'Basic employee access');

-- Assign permissions to roles
INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES
('rbac-role-1', 'perm-1'),
('rbac-role-1', 'perm-2'),
('rbac-role-1', 'perm-3'),
('rbac-role-1', 'perm-4'),
('rbac-role-1', 'perm-5'),
('rbac-role-1', 'perm-6'),
('rbac-role-1', 'perm-7'),
('rbac-role-1', 'perm-8'),
('rbac-role-2', 'perm-1'),
('rbac-role-2', 'perm-2'),
('rbac-role-2', 'perm-4'),
('rbac-role-2', 'perm-5'),
('rbac-role-3', 'perm-2'),
('rbac-role-3', 'perm-3'),
('rbac-role-3', 'perm-8');

-- Create indexes for better performance
CREATE INDEX idx_issues_status_priority ON issues(status, priority);
CREATE INDEX idx_issues_created_at_status ON issues(created_at, status);
CREATE INDEX idx_feedback_rating_created ON feedback(rating, created_at);

-- Create default admin user (password: admin123)
INSERT INTO dashboard_users (
    id, name, email, password, role, created_at
) VALUES (
    'admin-user-1',
    'System Admin',
    'admin@yulu.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeA.U0rqERAWLpK3u',
    'admin',
    NOW()
);

-- Assign admin role to default user
INSERT INTO rbac_user_roles (user_id, role_id) VALUES
('admin-user-1', 'rbac-role-1');
