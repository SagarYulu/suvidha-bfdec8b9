
-- Add missing columns to existing tables
ALTER TABLE issues ADD COLUMN escalated_at TIMESTAMP NULL;
ALTER TABLE issues ADD COLUMN escalation_level INT DEFAULT 0;
ALTER TABLE issues ADD COLUMN escalation_count INT DEFAULT 0;

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_file_attachments_issue_id (issue_id),
  INDEX idx_file_attachments_uploaded_by (uploaded_by),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Create user_permissions table for RBAC
CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(36),
  
  UNIQUE KEY unique_user_permission (user_id, permission_key),
  INDEX idx_user_permissions_user_id (user_id),
  INDEX idx_user_permissions_permission (permission_key)
);

-- Create escalation_rules table
CREATE TABLE IF NOT EXISTS escalation_rules (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  time_threshold_minutes INT NOT NULL,
  escalation_level INT NOT NULL,
  notify_to VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_escalation_rules_role (role),
  INDEX idx_escalation_rules_priority (priority),
  INDEX idx_escalation_rules_level (escalation_level)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  on_assignment BOOLEAN DEFAULT TRUE,
  on_resolution BOOLEAN DEFAULT TRUE,
  on_comment BOOLEAN DEFAULT TRUE,
  on_escalation BOOLEAN DEFAULT TRUE,
  on_status_change BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_notification_preferences_user_id (user_id)
);

-- Insert default escalation rules
INSERT INTO escalation_rules (id, role, priority, time_threshold_minutes, escalation_level, notify_to) VALUES
(UUID(), 'employee', 'low', 2880, 1, 'agent'), -- 48 hours
(UUID(), 'employee', 'medium', 1440, 1, 'agent'), -- 24 hours
(UUID(), 'employee', 'high', 720, 1, 'manager'), -- 12 hours
(UUID(), 'employee', 'critical', 240, 1, 'admin'), -- 4 hours
(UUID(), 'agent', 'low', 1440, 2, 'manager'), -- 24 hours
(UUID(), 'agent', 'medium', 720, 2, 'manager'), -- 12 hours
(UUID(), 'agent', 'high', 360, 2, 'admin'), -- 6 hours
(UUID(), 'agent', 'critical', 120, 2, 'admin'); -- 2 hours

-- Insert default permissions
INSERT INTO user_permissions (user_id, permission_key) 
SELECT id, 'view:dashboard' FROM dashboard_users WHERE role IN ('admin', 'manager', 'agent');

INSERT INTO user_permissions (user_id, permission_key) 
SELECT id, 'manage:issues' FROM dashboard_users WHERE role IN ('admin', 'manager', 'agent');

INSERT INTO user_permissions (user_id, permission_key) 
SELECT id, 'escalate:issues' FROM dashboard_users WHERE role IN ('admin', 'manager');

INSERT INTO user_permissions (user_id, permission_key) 
SELECT id, 'view:reports' FROM dashboard_users WHERE role IN ('admin', 'manager');

INSERT INTO user_permissions (user_id, permission_key) 
SELECT id, 'manage:users' FROM dashboard_users WHERE role = 'admin';
