
-- Enhanced schema additions for 100% parity

-- Email logs table for tracking email notifications
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_message TEXT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
);

-- File attachments table for issue attachments
CREATE TABLE IF NOT EXISTS file_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (upload_by) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id),
  INDEX idx_upload_by (upload_by)
);

-- Real-time connection logs
CREATE TABLE IF NOT EXISTS realtime_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disconnected_at TIMESTAMP NULL,
  session_duration INT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_connected_at (connected_at)
);

-- Enhanced notifications with real-time support
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS 
  realtime_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS 
  email_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE notifications ADD INDEX IF NOT EXISTS 
  idx_realtime_sent (realtime_sent);

ALTER TABLE notifications ADD INDEX IF NOT EXISTS 
  idx_email_sent (email_sent);

-- Enhanced issues table for better file attachment support
ALTER TABLE issues ADD COLUMN IF NOT EXISTS 
  attachment_count INT DEFAULT 0;

ALTER TABLE issues ADD COLUMN IF NOT EXISTS 
  has_attachments BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
ALTER TABLE issues ADD INDEX IF NOT EXISTS 
  idx_has_attachments (has_attachments);

ALTER TABLE issues ADD INDEX IF NOT EXISTS 
  idx_type_status (type_id, status);

ALTER TABLE issues ADD INDEX IF NOT EXISTS 
  idx_assigned_status (assigned_to, status);

-- Enhanced feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS 
  email_notification_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE feedback ADD INDEX IF NOT EXISTS 
  idx_email_notification_sent (email_notification_sent);

-- Session management table for JWT tokens
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE KEY unique_token (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active)
);

-- Audit log enhancements
ALTER TABLE issue_audit_trail ADD COLUMN IF NOT EXISTS 
  ip_address VARCHAR(45) NULL;

ALTER TABLE issue_audit_trail ADD COLUMN IF NOT EXISTS 
  user_agent TEXT NULL;

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) NULL,
  INDEX idx_config_key (config_key)
);

-- Insert default system configurations
INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES
('email_notifications_enabled', 'true', 'Enable/disable email notifications'),
('realtime_updates_enabled', 'true', 'Enable/disable real-time updates'),
('file_upload_max_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('file_upload_allowed_types', 'jpg,jpeg,png,gif,pdf,doc,docx,txt,xlsx,xls', 'Allowed file upload types'),
('session_timeout_hours', '24', 'JWT session timeout in hours'),
('max_attachments_per_issue', '5', 'Maximum number of attachments per issue');

-- Performance optimization views
CREATE OR REPLACE VIEW issue_summary AS
SELECT 
  i.*,
  e.name as employee_name,
  e.email as employee_email,
  e.city as employee_city,
  du.name as assigned_to_name,
  (SELECT COUNT(*) FROM issue_comments ic WHERE ic.issue_id = i.id) as comment_count,
  (SELECT COUNT(*) FROM file_attachments fa WHERE fa.issue_id = i.id) as attachment_count,
  CASE 
    WHEN i.status = 'closed' THEN DATEDIFF(i.closed_at, i.created_at)
    ELSE DATEDIFF(NOW(), i.created_at)
  END as days_open
FROM issues i
LEFT JOIN employees e ON i.employee_uuid = e.id
LEFT JOIN dashboard_users du ON i.assigned_to = du.id;

-- Analytics view for dashboard
CREATE OR REPLACE VIEW dashboard_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_issues,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_issues,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_issues,
  AVG(CASE WHEN status = 'closed' THEN DATEDIFF(closed_at, created_at) END) as avg_resolution_days
FROM issues 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Update triggers for attachment counting
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_attachment_count_insert
AFTER INSERT ON file_attachments
FOR EACH ROW
BEGIN
  UPDATE issues 
  SET 
    attachment_count = (SELECT COUNT(*) FROM file_attachments WHERE issue_id = NEW.issue_id),
    has_attachments = TRUE
  WHERE id = NEW.issue_id;
END//

CREATE TRIGGER IF NOT EXISTS update_attachment_count_delete
AFTER DELETE ON file_attachments
FOR EACH ROW
BEGIN
  UPDATE issues 
  SET 
    attachment_count = (SELECT COUNT(*) FROM file_attachments WHERE issue_id = OLD.issue_id),
    has_attachments = (SELECT COUNT(*) > 0 FROM file_attachments WHERE issue_id = OLD.issue_id)
  WHERE id = OLD.issue_id;
END//

DELIMITER ;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_issues_compound ON issues(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_issues_employee_status ON issues(employee_uuid, status);
CREATE INDEX IF NOT EXISTS idx_comments_issue_created ON issue_comments(issue_id, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Cleanup old data procedures
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS cleanup_old_sessions()
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW() OR last_used < DATE_SUB(NOW(), INTERVAL 30 DAY);
  DELETE FROM realtime_connections WHERE disconnected_at IS NOT NULL AND disconnected_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM email_logs WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END//

DELIMITER ;

-- Create event for automatic cleanup (if events are enabled)
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL cleanup_old_sessions();
