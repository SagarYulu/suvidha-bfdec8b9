
-- Add missing tables for complete feature parity

-- Feedback table
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36) NOT NULL,
  `employee_uuid` varchar(36) NOT NULL,
  `rating` int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  INDEX `idx_feedback_issue` (`issue_id`),
  INDEX `idx_feedback_employee` (`employee_uuid`),
  INDEX `idx_feedback_rating` (`rating`),
  INDEX `idx_feedback_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Escalations table
CREATE TABLE IF NOT EXISTS `escalations` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36) NOT NULL,
  `escalated_from` varchar(36),
  `escalated_to` varchar(36) NOT NULL,
  `escalation_type` enum('manual', 'auto_critical', 'auto_breach') DEFAULT 'manual',
  `reason` text NOT NULL,
  `escalated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL,
  `resolved_by` varchar(36),
  `status` enum('pending', 'resolved') DEFAULT 'pending',
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`escalated_from`) REFERENCES `dashboard_users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`escalated_to`) REFERENCES `dashboard_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`resolved_by`) REFERENCES `dashboard_users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `dashboard_users`(`id`) ON DELETE CASCADE,
  INDEX `idx_escalations_issue` (`issue_id`),
  INDEX `idx_escalations_status` (`status`),
  INDEX `idx_escalations_type` (`escalation_type`),
  INDEX `idx_escalations_escalated_to` (`escalated_to`),
  INDEX `idx_escalations_created` (`escalated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit trail table
CREATE TABLE IF NOT EXISTS `audit_trail` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `issue_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_value` json,
  `new_value` json,
  `metadata` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `dashboard_users`(`id`) ON DELETE CASCADE,
  INDEX `idx_audit_issue` (`issue_id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `issue_id` varchar(36),
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` boolean DEFAULT FALSE,
  `read_at` timestamp NULL,
  `sent_via` enum('in-app', 'email', 'sms') DEFAULT 'in-app',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `dashboard_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_issue` (`issue_id`),
  INDEX `idx_notifications_type` (`type`),
  INDEX `idx_notifications_read` (`is_read`),
  INDEX `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to issues table for escalation tracking
ALTER TABLE `issues` 
ADD COLUMN IF NOT EXISTS `escalated_at` timestamp NULL,
ADD COLUMN IF NOT EXISTS `escalated_to` varchar(36),
ADD COLUMN IF NOT EXISTS `mapped_type_id` varchar(100),
ADD COLUMN IF NOT EXISTS `mapped_sub_type_id` varchar(100),
ADD COLUMN IF NOT EXISTS `mapped_at` timestamp NULL,
ADD COLUMN IF NOT EXISTS `mapped_by` varchar(36);

-- Add foreign key for escalated_to
ALTER TABLE `issues` 
ADD CONSTRAINT `fk_issues_escalated_to` FOREIGN KEY (`escalated_to`) REFERENCES `dashboard_users`(`id`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_issues_mapped_by` FOREIGN KEY (`mapped_by`) REFERENCES `dashboard_users`(`id`) ON DELETE SET NULL;

-- Add indexes for new columns
ALTER TABLE `issues` 
ADD INDEX `idx_issues_escalated_at` (`escalated_at`),
ADD INDEX `idx_issues_escalated_to` (`escalated_to`),
ADD INDEX `idx_issues_mapped_type` (`mapped_type_id`),
ADD INDEX `idx_issues_mapped_at` (`mapped_at`);

-- Update issues table to support JSON attachments
ALTER TABLE `issues` 
MODIFY COLUMN `attachments` json;

-- Create views for easier querying

-- View for issue summary with escalation info
CREATE OR REPLACE VIEW `issue_summary` AS
SELECT 
  i.id,
  i.employee_uuid,
  i.type_id,
  i.sub_type_id,
  i.description,
  i.status,
  i.priority,
  i.created_at,
  i.updated_at,
  i.closed_at,
  i.assigned_to,
  u.name as assigned_to_name,
  u.role as assigned_to_role,
  i.escalated_at,
  i.escalated_to,
  eu.name as escalated_to_name,
  DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) as days_open,
  CASE 
    WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 7 THEN 'normal'
    WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 14 THEN 'warning'
    WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 30 THEN 'critical'
    ELSE 'breach'
  END as tat_status,
  (SELECT COUNT(*) FROM escalations e WHERE e.issue_id = i.id AND e.status = 'pending') as pending_escalations,
  (SELECT AVG(rating) FROM feedback f WHERE f.issue_id = i.id) as feedback_rating,
  (SELECT COUNT(*) FROM feedback f WHERE f.issue_id = i.id) as feedback_count
FROM issues i
LEFT JOIN dashboard_users u ON i.assigned_to = u.id
LEFT JOIN dashboard_users eu ON i.escalated_to = eu.id;

-- View for escalation summary
CREATE OR REPLACE VIEW `escalation_summary` AS
SELECT 
  e.id,
  e.issue_id,
  i.description as issue_description,
  i.priority as issue_priority,
  e.escalation_type,
  e.reason,
  e.escalated_at,
  e.resolved_at,
  e.status,
  uf.name as escalated_from_name,
  uf.role as escalated_from_role,
  ut.name as escalated_to_name,
  ut.role as escalated_to_role,
  uc.name as created_by_name,
  ur.name as resolved_by_name,
  TIMESTAMPDIFF(HOUR, e.escalated_at, COALESCE(e.resolved_at, NOW())) as resolution_hours
FROM escalations e
JOIN issues i ON e.issue_id = i.id
LEFT JOIN dashboard_users uf ON e.escalated_from = uf.id
LEFT JOIN dashboard_users ut ON e.escalated_to = ut.id
LEFT JOIN dashboard_users uc ON e.created_by = uc.id
LEFT JOIN dashboard_users ur ON e.resolved_by = ur.id;

-- View for feedback summary
CREATE OR REPLACE VIEW `feedback_summary` AS
SELECT 
  f.id,
  f.issue_id,
  i.description as issue_description,
  i.status as issue_status,
  f.rating,
  f.comment,
  f.created_at,
  e.name as employee_name,
  e.email as employee_email,
  u.name as assigned_to_name,
  CASE 
    WHEN f.rating >= 4 THEN 'positive'
    WHEN f.rating <= 2 THEN 'negative'
    ELSE 'neutral'
  END as sentiment
FROM feedback f
JOIN issues i ON f.issue_id = i.id
LEFT JOIN employees e ON f.employee_uuid = e.uuid
LEFT JOIN dashboard_users u ON i.assigned_to = u.id;

-- Insert sample escalation types if they don't exist
INSERT IGNORE INTO issue_types (id, name, description) VALUES 
('escalated', 'Escalated Issues', 'Issues that have been escalated');

INSERT IGNORE INTO issue_sub_types (type_id, id, name, description) VALUES 
('escalated', 'manual', 'Manual Escalation', 'Manually escalated by user'),
('escalated', 'auto_critical', 'Auto Critical', 'Automatically escalated due to critical TAT'),
('escalated', 'auto_breach', 'SLA Breach', 'Automatically escalated due to SLA breach');
