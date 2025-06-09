
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type ENUM('assignment', 'status_change', 'comment', 'escalation', 'resolution') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  issue_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_issue_id (issue_id)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  on_assignment BOOLEAN DEFAULT TRUE,
  on_status_change BOOLEAN DEFAULT TRUE,
  on_comment BOOLEAN DEFAULT TRUE,
  on_escalation BOOLEAN DEFAULT TRUE,
  on_resolution BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);
