
-- MySQL Database Schema for Grievance Portal
-- Version: 1.0
-- Compatible with MySQL 8.0+
-- 
-- This schema supports the complete windsurf-backend architecture
-- including User management, Issue tracking, Comments, Audit trails, and Analytics

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grievance_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grievance_portal;

-- ========================================
-- CORE USER TABLES
-- ========================================

-- Main employees table (primary user data)
CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    emp_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_id VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    manager VARCHAR(255),
    role ENUM('employee', 'admin', 'support', 'manager') DEFAULT 'employee',
    cluster VARCHAR(100),
    city VARCHAR(100),
    date_of_joining DATE,
    blood_group VARCHAR(10),
    date_of_birth DATE,
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_employees_emp_id (emp_id),
    UNIQUE KEY uk_employees_email (email),
    INDEX idx_employees_role (role),
    INDEX idx_employees_city (city),
    INDEX idx_employees_cluster (cluster),
    INDEX idx_employees_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard users table (admin interface users)
CREATE TABLE IF NOT EXISTS dashboard_users (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    user_id VARCHAR(50),
    phone VARCHAR(20),
    city VARCHAR(100),
    cluster VARCHAR(100),
    manager VARCHAR(255),
    role ENUM('admin', 'support', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    last_updated_by CHAR(36),
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_dashboard_users_email (email),
    INDEX idx_dashboard_users_role (role),
    INDEX idx_dashboard_users_active (is_active),
    INDEX idx_dashboard_users_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ISSUE MANAGEMENT TABLES
-- ========================================

-- Main issues table
CREATE TABLE IF NOT EXISTS issues (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    employee_uuid CHAR(36) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    sub_type_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    assigned_to CHAR(36),
    attachment_url TEXT,
    attachments JSON,
    mapped_type_id VARCHAR(50),
    mapped_sub_type_id VARCHAR(50),
    mapped_by CHAR(36),
    mapped_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    PRIMARY KEY (id),
    INDEX idx_issues_employee (employee_uuid),
    INDEX idx_issues_status (status),
    INDEX idx_issues_priority (priority),
    INDEX idx_issues_type (type_id),
    INDEX idx_issues_subtype (sub_type_id),
    INDEX idx_issues_assigned_to (assigned_to),
    INDEX idx_issues_created_at (created_at),
    INDEX idx_issues_status_priority (status, priority),
    
    FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL,
    FOREIGN KEY (mapped_by) REFERENCES dashboard_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid CHAR(36),
    admin_user_id CHAR(36),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_issue_comments_issue (issue_id),
    INDEX idx_issue_comments_employee (employee_uuid),
    INDEX idx_issue_comments_admin (admin_user_id),
    INDEX idx_issue_comments_created_at (created_at),
    
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_user_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_comment_author CHECK (
        (employee_uuid IS NOT NULL AND admin_user_id IS NULL) OR 
        (employee_uuid IS NULL AND admin_user_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Internal comments (admin only)
CREATE TABLE IF NOT EXISTS issue_internal_comments (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    admin_user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_internal_comments_issue (issue_id),
    INDEX idx_internal_comments_admin (admin_user_id),
    INDEX idx_internal_comments_created_at (created_at),
    
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue audit trail
CREATE TABLE IF NOT EXISTS issue_audit_trail (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    user_type ENUM('employee', 'admin') NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_audit_issue (issue_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created_at (created_at),
    
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue notifications
CREATE TABLE IF NOT EXISTS issue_notifications (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    user_type ENUM('employee', 'admin') NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_notifications_issue (issue_id),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_user_type (user_type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- FEEDBACK AND ANALYTICS
-- ========================================

-- Ticket feedback
CREATE TABLE IF NOT EXISTS ticket_feedback (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    issue_id CHAR(36) NOT NULL,
    employee_uuid CHAR(36) NOT NULL,
    feedback_option VARCHAR(100) NOT NULL,
    sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
    agent_id CHAR(36),
    agent_name VARCHAR(255),
    city VARCHAR(100),
    cluster VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_feedback_issue (issue_id),
    INDEX idx_feedback_employee (employee_uuid),
    INDEX idx_feedback_sentiment (sentiment),
    INDEX idx_feedback_agent (agent_id),
    INDEX idx_feedback_city (city),
    INDEX idx_feedback_cluster (cluster),
    INDEX idx_feedback_created_at (created_at),
    
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_uuid) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES dashboard_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- MASTER DATA TABLES
-- ========================================

-- Cities master
CREATE TABLE IF NOT EXISTS master_cities (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_master_cities_name (name),
    INDEX idx_master_cities_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clusters master
CREATE TABLE IF NOT EXISTS master_clusters (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    city_id CHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_master_clusters_city (city_id),
    INDEX idx_master_clusters_name (name),
    INDEX idx_master_clusters_active (is_active),
    
    FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue types master
CREATE TABLE IF NOT EXISTS master_issue_types (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_issue_types_category (category),
    INDEX idx_issue_types_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue sub-types master
CREATE TABLE IF NOT EXISTS master_issue_sub_types (
    id VARCHAR(50) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_issue_sub_types_type (type_id),
    INDEX idx_issue_sub_types_active (is_active),
    
    FOREIGN KEY (type_id) REFERENCES master_issue_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RBAC TABLES
-- ========================================

-- RBAC Roles
CREATE TABLE IF NOT EXISTS rbac_roles (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_rbac_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Permissions
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_rbac_permissions_name (name),
    INDEX idx_rbac_permissions_resource (resource),
    INDEX idx_rbac_permissions_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Role Permissions
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_rbac_role_permissions_role (role_id),
    INDEX idx_rbac_role_permissions_permission (permission_id),
    
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC User Roles
CREATE TABLE IF NOT EXISTS rbac_user_roles (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    user_type ENUM('employee', 'dashboard_user') NOT NULL,
    role_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_role (user_id, user_type, role_id),
    INDEX idx_rbac_user_roles_user (user_id, user_type),
    INDEX idx_rbac_user_roles_role (role_id),
    
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- AUDIT TABLES
-- ========================================

-- User audit logs
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    entity_type ENUM('employee', 'dashboard_user') NOT NULL,
    entity_id CHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSON,
    performed_by CHAR(36),
    performed_by_type ENUM('employee', 'dashboard_user'),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    PRIMARY KEY (id),
    INDEX idx_user_audit_entity (entity_type, entity_id),
    INDEX idx_user_audit_performer (performed_by, performed_by_type),
    INDEX idx_user_audit_action (action),
    INDEX idx_user_audit_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System audit logs
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    entity_type VARCHAR(50) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSON,
    created_by CHAR(36) NOT NULL,
    created_by_type ENUM('employee', 'dashboard_user') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_system_audit_entity (entity_type, entity_id),
    INDEX idx_system_audit_creator (created_by, created_by_type),
    INDEX idx_system_audit_action (action),
    INDEX idx_system_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SESSIONS TABLE (for JWT blacklisting)
-- ========================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    user_type ENUM('employee', 'dashboard_user') NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_sessions_token (token_hash),
    INDEX idx_sessions_user (user_id, user_type),
    INDEX idx_sessions_expires (expires_at),
    INDEX idx_sessions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT INITIAL DATA
-- ========================================

-- Insert default cities
INSERT IGNORE INTO master_cities (name, state) VALUES 
('Bangalore', 'Karnataka'),
('Mumbai', 'Maharashtra'),
('Delhi', 'Delhi'),
('Chennai', 'Tamil Nadu'),
('Pune', 'Maharashtra'),
('Hyderabad', 'Telangana'),
('Kolkata', 'West Bengal'),
('Ahmedabad', 'Gujarat');

-- Insert default issue types
INSERT IGNORE INTO master_issue_types (id, name, description, category) VALUES 
('salary', 'Salary & Compensation', 'Issues related to salary, incentives, and compensation', 'HR'),
('leave', 'Leave Management', 'Issues related to leave applications and policies', 'HR'),
('policy', 'Policy & Compliance', 'Questions about company policies and compliance', 'HR'),
('technical', 'Technical Support', 'Technical issues with systems and equipment', 'IT'),
('workplace', 'Workplace Issues', 'Workplace environment and safety concerns', 'Operations'),
('benefits', 'Benefits & Insurance', 'Health insurance and employee benefits', 'HR'),
('training', 'Training & Development', 'Training programs and skill development', 'HR'),
('grievance', 'General Grievance', 'General complaints and grievances', 'HR');

-- Insert default sub-types
INSERT IGNORE INTO master_issue_sub_types (id, type_id, name) VALUES 
('salary_delay', 'salary', 'Salary Delay'),
('salary_deduction', 'salary', 'Unauthorized Deduction'),
('incentive_missing', 'salary', 'Missing Incentives'),
('leave_approval', 'leave', 'Leave Approval Delay'),
('leave_balance', 'leave', 'Leave Balance Issue'),
('sick_leave', 'leave', 'Sick Leave Issue'),
('policy_clarification', 'policy', 'Policy Clarification'),
('compliance_issue', 'policy', 'Compliance Issue'),
('system_access', 'technical', 'System Access Issue'),
('equipment_malfunction', 'technical', 'Equipment Malfunction'),
('safety_concern', 'workplace', 'Safety Concern'),
('harassment', 'workplace', 'Harassment Issue'),
('insurance_claim', 'benefits', 'Insurance Claim'),
('benefit_enrollment', 'benefits', 'Benefit Enrollment'),
('training_request', 'training', 'Training Request'),
('skill_development', 'training', 'Skill Development'),
('other_grievance', 'grievance', 'Other Grievance');

-- Insert default RBAC roles
INSERT IGNORE INTO rbac_roles (name, description, is_system) VALUES 
('super_admin', 'Super Administrator with full system access', TRUE),
('admin', 'Administrator with management access', TRUE),
('support', 'Support staff with issue management access', TRUE),
('manager', 'Team manager with team oversight access', TRUE),
('employee', 'Regular employee with basic access', TRUE);

-- Insert default RBAC permissions
INSERT IGNORE INTO rbac_permissions (name, description, resource, action) VALUES 
('create_issue', 'Create new issues', 'issues', 'create'),
('view_own_issues', 'View own issues', 'issues', 'read'),
('view_all_issues', 'View all issues in system', 'issues', 'read_all'),
('update_issue_status', 'Update issue status', 'issues', 'update'),
('assign_issues', 'Assign issues to users', 'issues', 'assign'),
('delete_issues', 'Delete issues', 'issues', 'delete'),
('add_comments', 'Add comments to issues', 'comments', 'create'),
('view_comments', 'View issue comments', 'comments', 'read'),
('add_internal_comments', 'Add internal comments', 'internal_comments', 'create'),
('view_internal_comments', 'View internal comments', 'internal_comments', 'read'),
('manage_users', 'Manage user accounts', 'users', 'manage'),
('view_analytics', 'View system analytics', 'analytics', 'read'),
('export_data', 'Export system data', 'data', 'export'),
('manage_settings', 'Manage system settings', 'settings', 'manage');

-- Insert default admin user
INSERT IGNORE INTO dashboard_users (id, name, email, role, password) VALUES 
('admin-default-uuid', 'System Administrator', 'admin@grievance.local', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeM8XfaQrMEXuKl3q');

SET FOREIGN_KEY_CHECKS = 1;

-- Success message
SELECT 'Grievance Portal MySQL schema created successfully!' as message,
       'Total tables created: 19' as tables_count,
       'Indexes optimized for performance' as optimization,
       'Foreign key constraints enforced' as integrity;
