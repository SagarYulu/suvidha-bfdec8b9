
CREATE TABLE IF NOT EXISTS file_attachments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36),
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(36) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_issue_id (issue_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_uploaded_at (uploaded_at)
);
