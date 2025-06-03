
-- MySQL Schema for Grievance Portal
-- Complete recreation of Supabase/PostgreSQL schema
-- Compatible with MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal;
USE grievance_portal;

-- Master Cities Table
CREATE TABLE IF NOT EXISTS master_cities (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_master_cities_name (name),
    INDEX idx_master_cities_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Clusters Table
CREATE TABLE IF NOT EXISTS master_clusters (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    city_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE,
    INDEX idx_master_clusters_city (city_id),
    INDEX idx_master_clusters_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Roles Table
CREATE TABLE IF NOT EXISTS master_roles (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_master_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Roles Table
CREATE TABLE IF NOT EXISTS rbac_roles (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_rbac_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Permissions Table
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_rbac_permissions_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Role Permissions Mapping
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    emp_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_id VARCHAR(50),
    city VARCHAR(255),
    cluster VARCHAR(255),
    manager VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employee',
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    date_of_joining DATE,
    blood_group VARCHAR(10),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_employees_emp_id (emp_id),
    UNIQUE KEY uk_employees_email (email),
    INDEX idx_employees_city (city),
    INDEX idx_employees_cluster (cluster),
    INDEX idx_employees_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Users Table
CREATE TABLE IF NOT EXISTS dashboard_users (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    user_id VARCHAR(50),
    phone VARCHAR(20),
    city VARCHAR(255),
    cluster VARCHAR(255),
    manager VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    last_updated_by CHAR(36),
    PRIMARY KEY (id),
    UNIQUE KEY uk_dashboard_users_email (email),
    INDEX idx_dashboard_users_role (role),
    INDEX idx_dashboard_users_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC User Roles Mapping
CREATE TABLE IF NOT EXISTS rbac_user_roles (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_rbac_user_roles_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    employee_uuid VARCHAR(255) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    sub_type_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR(255),
    attachment_url TEXT,
    attachments JSON,
    mapped_type_id VARCHAR(50),
    mapped_sub_type_id VARCHAR(50),
    mapped_by VARCHAR(255),
    mapped_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    INDEX idx_issues_employee (employee_uuid),
    INDEX idx_issues_status (status),
    INDEX idx_issues_priority (priority),
    INDEX idx_issues_type (type_id),
    INDEX idx_issues_assigned_to (assigned_to),
    INDEX idx_issues_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Comments Table
CREATE TABLE IF NOT EXISTS issue_comments (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_comments_issue (issue_id),
    INDEX idx_issue_comments_employee (employee_uuid),
    INDEX idx_issue_comments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Internal Comments Table
CREATE TABLE IF NOT EXISTS issue_internal_comments (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_internal_comments_issue (issue_id),
    INDEX idx_issue_internal_comments_employee (employee_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Audit Trail Table
CREATE TABLE IF NOT EXISTS issue_audit_trail (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    details JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_audit_trail_issue (issue_id),
    INDEX idx_issue_audit_trail_employee (employee_uuid),
    INDEX idx_issue_audit_trail_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Notifications Table
CREATE TABLE IF NOT EXISTS issue_notifications (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_notifications_issue (issue_id),
    INDEX idx_issue_notifications_user (user_id),
    INDEX idx_issue_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ticket Feedback Table
CREATE TABLE IF NOT EXISTS ticket_feedback (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid VARCHAR(255) NOT NULL,
    feedback_option VARCHAR(255) NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    agent_id VARCHAR(255),
    agent_name VARCHAR(255),
    city VARCHAR(255),
    cluster VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_ticket_feedback_issue (issue_id),
    INDEX idx_ticket_feedback_employee (employee_uuid),
    INDEX idx_ticket_feedback_sentiment (sentiment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard User Audit Logs Table
CREATE TABLE IF NOT EXISTS dashboard_user_audit_logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    entity_type VARCHAR(255) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    changes JSON NOT NULL,
    performed_by CHAR(36),
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_dashboard_user_audit_logs_entity (entity_type, entity_id),
    INDEX idx_dashboard_user_audit_logs_performed_by (performed_by),
    INDEX idx_dashboard_user_audit_logs_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Audit Logs Table
CREATE TABLE IF NOT EXISTS master_audit_logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    entity_type VARCHAR(255) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    changes JSON NOT NULL,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_master_audit_logs_entity (entity_type, entity_id),
    INDEX idx_master_audit_logs_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default master data
INSERT IGNORE INTO master_cities (id, name) VALUES 
(UUID(), 'Mumbai'),
(UUID(), 'Delhi'),
(UUID(), 'Bangalore'),
(UUID(), 'Chennai'),
(UUID(), 'Pune'),
(UUID(), 'Hyderabad');

-- Insert default roles
INSERT IGNORE INTO master_roles (id, name) VALUES 
(UUID(), 'employee'),
(UUID(), 'admin'),
(UUID(), 'support'),
(UUID(), 'manager');

-- Insert RBAC roles
INSERT IGNORE INTO rbac_roles (id, name, description) VALUES 
(UUID(), 'admin', 'Full system access'),
(UUID(), 'support', 'Customer support access'),
(UUID(), 'employee', 'Employee access'),
(UUID(), 'manager', 'Management access');

-- Insert RBAC permissions
INSERT IGNORE INTO rbac_permissions (id, name, description) VALUES 
(UUID(), 'create:issues', 'Create new issues'),
(UUID(), 'read:issues', 'Read issues'),
(UUID(), 'update:issues', 'Update issues'),
(UUID(), 'delete:issues', 'Delete issues'),
(UUID(), 'manage:users', 'Manage users'),
(UUID(), 'view:analytics', 'View analytics'),
(UUID(), 'manage:settings', 'Manage system settings');

-- Create default admin user
INSERT IGNORE INTO dashboard_users (id, name, email, role, password) VALUES 
(UUID(), 'Admin User', 'admin@yulu.com', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeM8XfaQrMEXuKl3q');

SET FOREIGN_KEY_CHECKS = 1;

-- Schema creation completed
SELECT 'MySQL schema created successfully!' as status;
