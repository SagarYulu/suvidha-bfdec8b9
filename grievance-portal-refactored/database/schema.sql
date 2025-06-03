
-- Grievance Portal MySQL Schema
-- Generated from Supabase PostgreSQL schema

SET FOREIGN_KEY_CHECKS = 0;

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE grievance_portal;

-- Dashboard User Audit Logs Table
CREATE TABLE IF NOT EXISTS dashboard_user_audit_logs (
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

-- Dashboard Users Table
CREATE TABLE IF NOT EXISTS dashboard_users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    employee_id VARCHAR(50),
    city VARCHAR(100),
    cluster VARCHAR(100),
    manager VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    last_updated_by VARCHAR(36),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_employee_id (employee_id),
    INDEX idx_city (city),
    INDEX idx_cluster (cluster)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    emp_id VARCHAR(50) NOT NULL UNIQUE,
    city VARCHAR(100),
    cluster VARCHAR(100),
    manager VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employee',
    date_of_joining DATE,
    blood_group VARCHAR(10),
    date_of_birth DATE,
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_emp_id (emp_id),
    INDEX idx_role (role),
    INDEX idx_city (city),
    INDEX idx_cluster (cluster)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(36) PRIMARY KEY,
    employee_uuid VARCHAR(36) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    sub_type_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    assigned_to VARCHAR(36),
    attachment_url TEXT,
    attachments JSON,
    mapped_type_id VARCHAR(50),
    mapped_sub_type_id VARCHAR(50),
    mapped_by VARCHAR(36),
    mapped_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee (employee_uuid),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_type (type_id),
    INDEX idx_sub_type (sub_type_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status_priority (status, priority)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Issue Audit Trail Table
CREATE TABLE IF NOT EXISTS issue_audit_trail (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSON,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_issue_id (issue_id),
    INDEX idx_employee (employee_uuid),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Issue Comments Table
CREATE TABLE IF NOT EXISTS issue_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_issue_id (issue_id),
    INDEX idx_employee (employee_uuid),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Issue Internal Comments Table
CREATE TABLE IF NOT EXISTS issue_internal_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_issue_id (issue_id),
    INDEX idx_employee (employee_uuid),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Issue Notifications Table
CREATE TABLE IF NOT EXISTS issue_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_issue_id (issue_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ticket Feedback Table
CREATE TABLE IF NOT EXISTS ticket_feedback (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    feedback_option VARCHAR(100) NOT NULL,
    sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
    agent_id VARCHAR(36),
    agent_name VARCHAR(255),
    city VARCHAR(100),
    cluster VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_issue_id (issue_id),
    INDEX idx_employee (employee_uuid),
    INDEX idx_sentiment (sentiment),
    INDEX idx_feedback_option (feedback_option),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    UNIQUE KEY unique_feedback_per_issue (issue_id, employee_uuid)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Cities Table
CREATE TABLE IF NOT EXISTS master_cities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Clusters Table
CREATE TABLE IF NOT EXISTS master_clusters (
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
CREATE TABLE IF NOT EXISTS master_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RBAC Permissions Table
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RBAC Roles Table
CREATE TABLE IF NOT EXISTS rbac_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RBAC Role Permissions Table
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RBAC User Roles Table
CREATE TABLE IF NOT EXISTS rbac_user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Audit Logs Table
CREATE TABLE IF NOT EXISTS master_audit_logs (
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

-- Insert default master data
INSERT IGNORE INTO master_cities (id, name) VALUES 
('city-1', 'Bangalore'),
('city-2', 'Mumbai'), 
('city-3', 'Delhi'),
('city-4', 'Chennai'),
('city-5', 'Hyderabad'),
('city-6', 'Pune'),
('city-7', 'Kolkata');

INSERT IGNORE INTO master_clusters (id, city_id, name) VALUES
('cluster-1', 'city-1', 'North Bangalore'),
('cluster-2', 'city-1', 'South Bangalore'),
('cluster-3', 'city-2', 'Central Mumbai'),
('cluster-4', 'city-2', 'Suburban Mumbai'),
('cluster-5', 'city-3', 'Central Delhi'),
('cluster-6', 'city-3', 'South Delhi');

INSERT IGNORE INTO master_roles (id, name) VALUES
('role-1', 'admin'),
('role-2', 'security-admin'),
('role-3', 'employee'),
('role-4', 'City Head'),
('role-5', 'Cluster Head'),
('role-6', 'HR Admin');

-- Insert RBAC permissions
INSERT IGNORE INTO rbac_permissions (id, name, description) VALUES
('perm-1', 'manage:issues', 'Can manage all issues'),
('perm-2', 'view:issues', 'Can view issues'),
('perm-3', 'create:issues', 'Can create issues'),
('perm-4', 'manage:users', 'Can manage users'),
('perm-5', 'view:analytics', 'Can view analytics'),
('perm-6', 'manage:analytics', 'Can manage analytics'),
('perm-7', 'manage:feedback', 'Can manage feedback'),
('perm-8', 'view:feedback', 'Can view feedback');

-- Insert RBAC roles
INSERT IGNORE INTO rbac_roles (id, name, description) VALUES
('rbac-role-1', 'Admin', 'Full system access'),
('rbac-role-2', 'Security Admin', 'Security and user management'),
('rbac-role-3', 'Employee', 'Basic employee access');

-- Assign permissions to roles
INSERT IGNORE INTO rbac_role_permissions (id, role_id, permission_id) VALUES
('rp-1', 'rbac-role-1', 'perm-1'),
('rp-2', 'rbac-role-1', 'perm-2'),
('rp-3', 'rbac-role-1', 'perm-3'),
('rp-4', 'rbac-role-1', 'perm-4'),
('rp-5', 'rbac-role-1', 'perm-5'),
('rp-6', 'rbac-role-1', 'perm-6'),
('rp-7', 'rbac-role-1', 'perm-7'),
('rp-8', 'rbac-role-1', 'perm-8'),
('rp-9', 'rbac-role-2', 'perm-1'),
('rp-10', 'rbac-role-2', 'perm-2'),
('rp-11', 'rbac-role-2', 'perm-4'),
('rp-12', 'rbac-role-2', 'perm-5'),
('rp-13', 'rbac-role-3', 'perm-2'),
('rp-14', 'rbac-role-3', 'perm-3'),
('rp-15', 'rbac-role-3', 'perm-8');

SET FOREIGN_KEY_CHECKS = 1;

-- Create default admin user (password: admin123)
INSERT IGNORE INTO dashboard_users (
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
INSERT IGNORE INTO rbac_user_roles (id, user_id, role_id) VALUES
('ur-1', 'admin-user-1', 'rbac-role-1');
