
-- Create database
CREATE DATABASE IF NOT EXISTS yulu_issues;
USE yulu_issues;

-- Employees table
CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  emp_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('employee', 'admin', 'hr', 'manager') DEFAULT 'employee',
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  date_of_birth DATE,
  date_of_joining DATE,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  blood_group VARCHAR(5),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Issues table
CREATE TABLE issues (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_uuid VARCHAR(36) NOT NULL,
  description TEXT NOT NULL,
  type_id VARCHAR(100) NOT NULL,
  sub_type_id VARCHAR(100) NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to VARCHAR(36),
  mapped_type_id VARCHAR(100),
  mapped_sub_type_id VARCHAR(100),
  mapped_by VARCHAR(36),
  mapped_at TIMESTAMP NULL,
  attachment_url TEXT,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id),
  FOREIGN KEY (assigned_to) REFERENCES employees(id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);

-- Issue comments table
CREATE TABLE issue_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id)
);

-- Issue internal comments (admin only)
CREATE TABLE issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id)
);

-- Ticket feedback table
CREATE TABLE ticket_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  feedback_option VARCHAR(100) NOT NULL,
  sentiment VARCHAR(50) NOT NULL,
  agent_id VARCHAR(36),
  agent_name VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id)
);

-- Issue audit trail
CREATE TABLE issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_uuid) REFERENCES employees(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO employees (id, emp_id, name, email, password, role) VALUES 
('admin-uuid-1234', 'ADMIN001', 'System Administrator', 'admin@yulu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHHmvJ4H4ePQzqzK', 'admin');
