
-- Data Migration SQL Scripts (Windsurf Version)
-- Manual migration queries for transferring data from Supabase to MySQL

-- Note: This file contains example SQL for manual data migration
-- Use the migrate_from_supabase.js script for automated migration

-- Example: Migrate users data
-- INSERT INTO users (id, name, email, phone, employee_id, department, role, created_at, updated_at)
-- SELECT id, name, email, phone, employee_id, department, role, created_at, updated_at
-- FROM supabase_users_export;

-- Example: Migrate dashboard users
-- INSERT INTO dashboard_users (id, name, email, password, role, phone, department, created_at, updated_at)
-- SELECT id, name, email, password, role, phone, department, created_at, updated_at
-- FROM supabase_dashboard_users_export;

-- Example: Migrate issues
-- INSERT INTO issues (id, title, description, category, priority, status, employee_id, assigned_to, created_at, updated_at)
-- SELECT id, title, description, category, priority, status, employee_id, assigned_to, created_at, updated_at
-- FROM supabase_issues_export;

-- Example: Migrate comments
-- INSERT INTO issue_comments (id, issue_id, author_id, content, created_at)
-- SELECT id, issue_id, author_id, content, created_at
-- FROM supabase_comments_export;

-- Example: Migrate feedback
-- INSERT INTO feedback (id, issue_id, employee_id, rating, feedback_text, resolution_satisfaction, created_at)
-- SELECT id, issue_id, employee_id, rating, feedback_text, resolution_satisfaction, created_at
-- FROM supabase_feedback_export;

-- Data validation queries
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Dashboard Users', COUNT(*) FROM dashboard_users
UNION ALL
SELECT 'Issues', COUNT(*) FROM issues
UNION ALL
SELECT 'Comments', COUNT(*) FROM issue_comments
UNION ALL
SELECT 'Feedback', COUNT(*) FROM feedback;

-- Check for orphaned records
SELECT 'Issues without employees' as issue_type, COUNT(*) as count
FROM issues i
LEFT JOIN users u ON i.employee_id = u.id
WHERE i.employee_id IS NOT NULL AND u.id IS NULL

UNION ALL

SELECT 'Comments without issues', COUNT(*)
FROM issue_comments c
LEFT JOIN issues i ON c.issue_id = i.id
WHERE i.id IS NULL

UNION ALL

SELECT 'Feedback without issues', COUNT(*)
FROM feedback f
LEFT JOIN issues i ON f.issue_id = i.id
WHERE i.id IS NULL;
