
-- Grievance Portal MySQL Database Schema
-- Generated from Supabase schema

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS ticket_feedback;
DROP TABLE IF EXISTS issue_notifications;
DROP TABLE IF EXISTS issue_internal_comments;
DROP TABLE IF EXISTS issue_comments;
DROP TABLE IF EXISTS issue_audit_trail;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS rbac_user_roles;
DROP TABLE IF EXISTS rbac_role_permissions;
DROP TABLE IF EXISTS rbac_permissions;
DROP TABLE IF EXISTS rbac_roles;
DROP TABLE IF EXISTS dashboard_user_audit_logs;
DROP TABLE IF EXISTS dashboard_users;
DROP TABLE IF EXISTS master_clusters;
DROP TABLE IF EXISTS master_cities;
DROP TABLE IF EXISTS master_roles;
DROP TABLE IF EXISTS master_audit_logs;
DROP TABLE IF EXISTS employees;

-- Create employees table
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    emp_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    user_id VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    manager VARCHAR(255),
    role VARCHAR(100),
    cluster VARCHAR(255),
    city VARCHAR(255),
    date_of_birth DATE,
    date_of_joining DATE,
    ifsc_code VARCHAR(20),
    account_number VARCHAR(50),
    blood_group VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create master tables
CREATE TABLE master_cities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
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

CREATE TABLE master_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create dashboard users table
CREATE TABLE dashboard_users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    employee_id VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    manager VARCHAR(255),
    cluster VARCHAR(255),
    city VARCHAR(255),
    phone VARCHAR(20),
    user_id VARCHAR(255),
    created_by VARCHAR(36),
    last_updated_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create RBAC tables
CREATE TABLE rbac_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rbac_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
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

-- Create issues table
CREATE TABLE issues (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_uuid VARCHAR(36) NOT NULL,
    type_id VARCHAR(255) NOT NULL,
    sub_type_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR(36),
    mapped_type_id VARCHAR(255),
    mapped_sub_type_id VARCHAR(255),
    mapped_by VARCHAR(36),
    mapped_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    attachments JSON,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_uuid (employee_uuid),
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
);

-- Create issue comments table
CREATE TABLE issue_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id)
);

-- Create issue internal comments table
CREATE TABLE issue_internal_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id)
);

-- Create issue audit trail table
CREATE TABLE issue_audit_trail (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id),
    INDEX idx_created_at (created_at)
);

-- Create issue notifications table
CREATE TABLE issue_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

-- Create ticket feedback table
CREATE TABLE ticket_feedback (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_id VARCHAR(36) NOT NULL,
    employee_uuid VARCHAR(36) NOT NULL,
    feedback_option VARCHAR(255) NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    city VARCHAR(255),
    cluster VARCHAR(255),
    agent_id VARCHAR(36),
    agent_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_issue_id (issue_id),
    INDEX idx_sentiment (sentiment),
    INDEX idx_created_at (created_at)
);

-- Create audit logs tables
CREATE TABLE dashboard_user_audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    changes JSON NOT NULL,
    performed_by VARCHAR(36),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    changes JSON NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO master_cities (id, name) VALUES
('city-1', 'Mumbai'),
('city-2', 'Delhi'),
('city-3', 'Bangalore'),
('city-4', 'Chennai'),
('city-5', 'Hyderabad'),
('city-6', 'Pune'),
('city-7', 'Kolkata'),
('city-8', 'Ahmedabad');

INSERT INTO master_clusters (id, name, city_id) VALUES
('cluster-1', 'Andheri', 'city-1'),
('cluster-2', 'Bandra', 'city-1'),
('cluster-3', 'Connaught Place', 'city-2'),
('cluster-4', 'Karol Bagh', 'city-2'),
('cluster-5', 'Koramangala', 'city-3'),
('cluster-6', 'Whitefield', 'city-3'),
('cluster-7', 'T. Nagar', 'city-4'),
('cluster-8', 'Anna Nagar', 'city-4');

INSERT INTO master_roles (id, name) VALUES
('role-1', 'admin'),
('role-2', 'agent'),
('role-3', 'employee'),
('role-4', 'manager'),
('role-5', 'supervisor');

-- Insert RBAC data
INSERT INTO rbac_roles (id, name, description) VALUES
('rbac-role-1', 'super_admin', 'Full system access'),
('rbac-role-2', 'admin', 'Administrative access'),
('rbac-role-3', 'agent', 'Customer service agent'),
('rbac-role-4', 'employee', 'Regular employee access'),
('rbac-role-5', 'manager', 'Management level access');

INSERT INTO rbac_permissions (id, name, description) VALUES
('rbac-perm-1', 'view_all_issues', 'View all issues in the system'),
('rbac-perm-2', 'manage_users', 'Create, update, delete users'),
('rbac-perm-3', 'assign_issues', 'Assign issues to agents'),
('rbac-perm-4', 'view_analytics', 'Access analytics dashboard'),
('rbac-perm-5', 'manage_feedback', 'Manage feedback and sentiment analysis'),
('rbac-perm-6', 'create_issues', 'Create new issues'),
('rbac-perm-7', 'comment_on_issues', 'Add comments to issues'),
('rbac-perm-8', 'view_own_issues', 'View own created issues');

-- Assign permissions to roles
INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES
('rbac-role-1', 'rbac-perm-1'), ('rbac-role-1', 'rbac-perm-2'), ('rbac-role-1', 'rbac-perm-3'),
('rbac-role-1', 'rbac-perm-4'), ('rbac-role-1', 'rbac-perm-5'), ('rbac-role-1', 'rbac-perm-6'),
('rbac-role-1', 'rbac-perm-7'), ('rbac-role-1', 'rbac-perm-8'),
('rbac-role-2', 'rbac-perm-1'), ('rbac-role-2', 'rbac-perm-2'), ('rbac-role-2', 'rbac-perm-3'),
('rbac-role-2', 'rbac-perm-4'), ('rbac-role-2', 'rbac-perm-5'),
('rbac-role-3', 'rbac-perm-1'), ('rbac-role-3', 'rbac-perm-3'), ('rbac-role-3', 'rbac-perm-4'),
('rbac-role-3', 'rbac-perm-7'),
('rbac-role-4', 'rbac-perm-6'), ('rbac-role-4', 'rbac-perm-7'), ('rbac-role-4', 'rbac-perm-8'),
('rbac-role-5', 'rbac-perm-1'), ('rbac-role-5', 'rbac-perm-4'), ('rbac-role-5', 'rbac-perm-7');

-- Create default admin user (password: admin123)
INSERT INTO dashboard_users (id, name, email, password, role, created_at) VALUES
('admin-1', 'System Administrator', 'admin@grievanceportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW());

-- Assign admin role to default user
INSERT INTO rbac_user_roles (user_id, role_id) VALUES
('admin-1', 'rbac-role-1');

SET FOREIGN_KEY_CHECKS = 1;

-- Create indexes for better performance
CREATE INDEX idx_issues_employee_status ON issues(employee_uuid, status);
CREATE INDEX idx_issues_assigned_status ON issues(assigned_to, status);
CREATE INDEX idx_feedback_sentiment_date ON ticket_feedback(sentiment, created_at);
CREATE INDEX idx_audit_trail_action_date ON issue_audit_trail(action, created_at);

-- Display creation summary
SELECT 'Database schema created successfully!' as message;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE();
