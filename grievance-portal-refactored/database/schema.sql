
-- Grievance Portal MySQL Database Schema
-- Compatible with MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- ========================================
-- CREATE DATABASE AND TABLES
-- ========================================

-- Table: employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `emp_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O',
  `manager` varchar(255) DEFAULT NULL,
  `role` varchar(100) DEFAULT 'employee',
  `cluster` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emp_id` (`emp_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_emp_id` (`emp_id`),
  KEY `idx_email` (`email`),
  KEY `idx_city` (`city`),
  KEY `idx_cluster` (`cluster`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: dashboard_users
CREATE TABLE IF NOT EXISTS `dashboard_users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `manager` varchar(255) DEFAULT NULL,
  `role` varchar(100) NOT NULL DEFAULT 'employee',
  `password` varchar(255) NOT NULL,
  `is_active` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(36) DEFAULT NULL,
  `last_updated_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: issues
CREATE TABLE IF NOT EXISTS `issues` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `employee_uuid` varchar(36) NOT NULL,
  `type_id` varchar(50) NOT NULL,
  `sub_type_id` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `mapped_type_id` varchar(50) DEFAULT NULL,
  `mapped_sub_type_id` varchar(50) DEFAULT NULL,
  `mapped_by` varchar(36) DEFAULT NULL,
  `mapped_at` timestamp NULL DEFAULT NULL,
  `attachment_url` text DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee_uuid` (`employee_uuid`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_type_id` (`type_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: issue_comments
CREATE TABLE IF NOT EXISTS `issue_comments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) DEFAULT NULL,
  `admin_user_id` varchar(36) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_employee_uuid` (`employee_uuid`),
  KEY `idx_admin_user_id` (`admin_user_id`),
  CONSTRAINT `fk_issue_comments_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: issue_internal_comments
CREATE TABLE IF NOT EXISTS `issue_internal_comments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_employee_uuid` (`employee_uuid`),
  CONSTRAINT `fk_issue_internal_comments_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: issue_audit_trail
CREATE TABLE IF NOT EXISTS `issue_audit_trail` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_employee_uuid` (`employee_uuid`),
  KEY `idx_action` (`action`),
  CONSTRAINT `fk_issue_audit_trail_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: issue_notifications
CREATE TABLE IF NOT EXISTS `issue_notifications` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `issue_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `is_read` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `fk_issue_notifications_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ticket_feedback
CREATE TABLE IF NOT EXISTS `ticket_feedback` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `sentiment` enum('positive','neutral','negative') NOT NULL,
  `feedback_option` varchar(100) NOT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `agent_id` varchar(36) DEFAULT NULL,
  `agent_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_employee_uuid` (`employee_uuid`),
  KEY `idx_sentiment` (`sentiment`),
  KEY `idx_city` (`city`),
  CONSTRAINT `fk_ticket_feedback_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master data tables
CREATE TABLE IF NOT EXISTS `master_cities` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `master_clusters` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `city_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city_id` (`city_id`),
  CONSTRAINT `fk_master_clusters_city` FOREIGN KEY (`city_id`) REFERENCES `master_cities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Tables
CREATE TABLE IF NOT EXISTS `rbac_permissions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rbac_roles` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rbac_role_permissions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `role_id` varchar(36) NOT NULL,
  `permission_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rbac_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rbac_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `rbac_permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rbac_user_roles` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`, `role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_rbac_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit tables
CREATE TABLE IF NOT EXISTS `dashboard_user_audit_logs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `changes` json NOT NULL,
  `performed_by` varchar(36) DEFAULT NULL,
  `performed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_performed_by` (`performed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `master_audit_logs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `changes` json NOT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Insert default admin user
INSERT IGNORE INTO `dashboard_users` (`id`, `name`, `email`, `employee_id`, `role`, `password`) VALUES
('admin-uuid-1', 'Admin User', 'admin@yulu.com', 'ADMIN001', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYEykwLq/RBnmVG');

-- Insert sample cities
INSERT IGNORE INTO `master_cities` (`name`) VALUES
('Bangalore'),
('Mumbai'),
('Delhi'),
('Hyderabad'),
('Chennai'),
('Pune');

-- Insert sample employees
INSERT IGNORE INTO `employees` (`emp_id`, `name`, `email`, `phone`, `city`, `cluster`, `manager`, `role`) VALUES
('EMP001', 'John Doe', 'john.doe@yulu.com', '9876543210', 'Bangalore', 'Central', 'Manager Smith', 'employee'),
('EMP002', 'Jane Smith', 'jane.smith@yulu.com', '9876543211', 'Mumbai', 'West', 'Manager Jones', 'employee'),
('EMP003', 'Bob Johnson', 'bob.johnson@yulu.com', '9876543212', 'Delhi', 'North', 'Manager Brown', 'employee');

-- Insert RBAC data
INSERT IGNORE INTO `rbac_roles` (`name`, `description`) VALUES
('admin', 'Full system access'),
('support', 'Customer support access'),
('employee', 'Basic employee access');

INSERT IGNORE INTO `rbac_permissions` (`name`, `description`) VALUES
('create_issue', 'Create new issues'),
('view_all_issues', 'View all issues in system'),
('assign_issues', 'Assign issues to users'),
('manage_users', 'Manage user accounts'),
('view_analytics', 'View system analytics');

SET FOREIGN_KEY_CHECKS = 1;

-- Success message
SELECT 'Database schema created successfully!' as message;
