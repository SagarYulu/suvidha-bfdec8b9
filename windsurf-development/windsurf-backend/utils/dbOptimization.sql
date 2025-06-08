
-- Database optimization indexes for improved performance

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- Dashboard users table indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_role ON dashboard_users(role);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_active ON dashboard_users(is_active);

-- Issues table indexes
CREATE INDEX IF NOT EXISTS idx_issues_employee_uuid ON issues(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_type_id ON issues(type_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at);

-- Issue comments table indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_employee_uuid ON issue_comments(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- Internal comments table indexes
CREATE INDEX IF NOT EXISTS idx_issue_internal_comments_issue_id ON issue_internal_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_internal_comments_employee_uuid ON issue_internal_comments(employee_uuid);

-- Ticket feedback table indexes
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_employee_uuid ON ticket_feedback(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_issue_id ON ticket_feedback(issue_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_type ON ticket_feedback(type);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_sentiment ON ticket_feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_created_at ON ticket_feedback(created_at);

-- RBAC table indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Audit trail indexes
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_issue_id ON issue_audit_trail(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_employee_uuid ON issue_audit_trail(employee_uuid);
CREATE INDEX IF NOT EXISTS idx_issue_audit_trail_created_at ON issue_audit_trail(created_at);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_issues_employee_status ON issues(employee_uuid, status);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_status ON issues(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_feedback_employee_type ON ticket_feedback(employee_uuid, type);
