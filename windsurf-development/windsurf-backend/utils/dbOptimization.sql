
-- Database optimization indexes for improved performance

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_city ON employees(city);
CREATE INDEX IF NOT EXISTS idx_employees_cluster ON employees(cluster);

-- Dashboard users table indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_employee_id ON dashboard_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_user_id ON dashboard_users(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_role ON dashboard_users(role);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_created_at ON dashboard_users(created_at);

-- Issues table indexes
CREATE INDEX IF NOT EXISTS idx_issues_employee_uuid ON issues(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_type_id ON issues(type_id);
CREATE INDEX IF NOT EXISTS idx_issues_sub_type_id ON issues(sub_type_id);
CREATE INDEX IF NOT EXISTS idx_issues_mapped_type_id ON issues(mapped_type_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at);
CREATE INDEX IF NOT EXISTS idx_issues_closed_at ON issues(closed_at);

-- Issue comments table indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_employee_uuid ON issue_comments(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- Internal comments table indexes
CREATE INDEX IF NOT EXISTS idx_issue_internal_comments_issue_id ON issue_internal_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_internal_comments_employee_uuid ON issue_internal_comments(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issue_internal_comments_created_at ON issue_internal_comments(created_at);

-- Ticket feedback table indexes
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_employee_uuid ON ticket_feedback(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_issue_id ON ticket_feedback(issue_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_agent_id ON ticket_feedback(agent_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_sentiment ON ticket_feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_created_at ON ticket_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_city ON ticket_feedback(city);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_cluster ON ticket_feedback(cluster);

-- RBAC table indexes
CREATE INDEX IF NOT EXISTS idx_rbac_user_roles_user_id ON rbac_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_roles_role_id ON rbac_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_rbac_role_permissions_role_id ON rbac_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_rbac_role_permissions_permission_id ON rbac_role_permissions(permission_id);

-- Audit trail indexes
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_issue_id ON issue_audit_trail(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_employee_uuid ON issue_audit_trail(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_action ON issue_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_created_at ON issue_audit_trail(created_at);

-- Email logs indexes (create table if not exists)
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status ENUM('sent', 'failed', 'pending') NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_logs_recipient (recipient),
  INDEX idx_email_logs_status (status),
  INDEX idx_email_logs_sent_at (sent_at)
);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_issue_notifications_user_id ON issue_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_notifications_issue_id ON issue_notifications(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_notifications_is_read ON issue_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_issue_notifications_created_at ON issue_notifications(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_issues_employee_status ON issues(employee_uuid, status);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_status ON issues(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_issues_type_status ON issues(type_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_status_created ON issues(status, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_employee_sentiment ON ticket_feedback(employee_uuid, sentiment);
CREATE INDEX IF NOT EXISTS idx_feedback_issue_sentiment ON ticket_feedback(issue_id, sentiment);

-- Performance optimization for dashboard queries
CREATE INDEX IF NOT EXISTS idx_issues_status_priority ON issues(status, priority);
CREATE INDEX IF NOT EXISTS idx_issues_date_status ON issues(DATE(created_at), status);
CREATE INDEX IF NOT EXISTS idx_feedback_date_sentiment ON ticket_feedback(DATE(created_at), sentiment);

-- Add full-text search indexes for content search
ALTER TABLE issues ADD FULLTEXT(description);
ALTER TABLE issue_comments ADD FULLTEXT(content);

-- Update table statistics for MySQL optimizer
ANALYZE TABLE employees;
ANALYZE TABLE dashboard_users;
ANALYZE TABLE issues;
ANALYZE TABLE issue_comments;
ANALYZE TABLE issue_internal_comments;
ANALYZE TABLE ticket_feedback;
ANALYZE TABLE rbac_user_roles;
ANALYZE TABLE rbac_role_permissions;
