
-- Windsurf Grievance Portal Database Schema
-- Complete MySQL schema with all tables and relationships

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `issue_internal_comments`;
DROP TABLE IF EXISTS `issue_comments`;
DROP TABLE IF EXISTS `issues`;
DROP TABLE IF EXISTS `dashboard_users`;
DROP TABLE IF EXISTS `employees`;

SET FOREIGN_KEY_CHECKS = 1;

-- Employees table (for mobile login users)
CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `emp_id` varchar(50) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `phone` varchar(20),
  `city` varchar(50),
  `cluster` varchar(50),
  `role` enum('employee') DEFAULT 'employee',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_employees_email` (`email`),
  KEY `idx_employees_emp_id` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard users table (for admin/agent login)
CREATE TABLE `dashboard_users` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','agent') NOT NULL,
  `employee_id` varchar(50),
  `phone` varchar(20),
  `city` varchar(50),
  `cluster` varchar(50),
  `manager` varchar(100),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_dashboard_users_email` (`email`),
  KEY `idx_dashboard_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issues table
CREATE TABLE `issues` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `employee_uuid` varchar(36) NOT NULL,
  `type_id` varchar(50) NOT NULL,
  `sub_type_id` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `assigned_to` varchar(36) NULL,
  `attachment_url` varchar(500),
  `attachments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL,
  KEY `idx_issues_employee` (`employee_uuid`),
  KEY `idx_issues_status` (`status`),
  KEY `idx_issues_priority` (`priority`),
  KEY `idx_issues_assigned` (`assigned_to`),
  KEY `idx_issues_created` (`created_at`),
  CONSTRAINT `fk_issues_employee` FOREIGN KEY (`employee_uuid`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_issues_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `dashboard_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue comments table (public comments visible to employee)
CREATE TABLE `issue_comments` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_comments_issue` (`issue_id`),
  KEY `idx_comments_employee` (`employee_uuid`),
  KEY `idx_comments_created` (`created_at`),
  CONSTRAINT `fk_comments_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_employee` FOREIGN KEY (`employee_uuid`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue internal comments table (private comments for admin/agents only)
CREATE TABLE `issue_internal_comments` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_internal_comments_issue` (`issue_id`),
  KEY `idx_internal_comments_user` (`employee_uuid`),
  KEY `idx_internal_comments_created` (`created_at`),
  CONSTRAINT `fk_internal_comments_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_internal_comments_user` FOREIGN KEY (`employee_uuid`) REFERENCES `dashboard_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs table for tracking all actions
CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36),
  `user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` json,
  `ip_address` varchar(45),
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_audit_issue` (`issue_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data

-- Sample employees
INSERT INTO `employees` (`id`, `emp_id`, `name`, `email`, `phone`, `city`, `cluster`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'EMP001', 'John Doe', 'john.doe@company.com', '+91-9876543210', 'Mumbai', 'West'),
('550e8400-e29b-41d4-a716-446655440002', 'EMP002', 'Jane Smith', 'jane.smith@company.com', '+91-9876543211', 'Delhi', 'North'),
('550e8400-e29b-41d4-a716-446655440003', 'EMP003', 'Mike Johnson', 'mike.johnson@company.com', '+91-9876543212', 'Bangalore', 'South');

-- Sample dashboard users (password is 'password123' hashed with bcrypt)
INSERT INTO `dashboard_users` (`id`, `name`, `email`, `password`, `role`, `employee_id`) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Admin User', 'admin@windsurf.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNkHCpTEIL9.W', 'admin', 'ADM001'),
('550e8400-e29b-41d4-a716-446655440102', 'Manager User', 'manager@windsurf.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNkHCpTEIL9.W', 'manager', 'MGR001'),
('550e8400-e29b-41d4-a716-446655440103', 'Agent User', 'agent@windsurf.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNkHCpTEIL9.W', 'agent', 'AGT001');

-- Sample issues
INSERT INTO `issues` (`id`, `employee_uuid`, `type_id`, `sub_type_id`, `description`, `status`, `priority`, `assigned_to`) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'payroll', 'salary_discrepancy', 'My salary for this month is incorrect. Expected amount was 50000 but received 45000.', 'open', 'high', '550e8400-e29b-41d4-a716-446655440102'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'leave', 'leave_approval', 'My leave application for emergency leave was not approved in time.', 'in_progress', 'medium', '550e8400-e29b-41d4-a716-446655440103'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440003', 'it_support', 'laptop_issue', 'My laptop is not working properly. Screen keeps flickering.', 'resolved', 'low', '550e8400-e29b-41d4-a716-446655440103');

-- Sample comments
INSERT INTO `issue_comments` (`id`, `issue_id`, `employee_uuid`, `content`) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Please check my payslip and provide clarification.'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'This is urgent as I have a family emergency.');

-- Sample internal comments
INSERT INTO `issue_internal_comments` (`id`, `issue_id`, `employee_uuid`, `content`) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440102', 'Checking with HR department for salary calculation details.'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440103', 'Escalating to manager for emergency leave approval.');

-- Create indexes for better performance
CREATE INDEX idx_issues_type_status ON issues(type_id, status);
CREATE INDEX idx_issues_priority_created ON issues(priority, created_at);
CREATE INDEX idx_employees_city_cluster ON employees(city, cluster);
