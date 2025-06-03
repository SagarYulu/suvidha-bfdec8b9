
-- Data Migration Script from Supabase to MySQL
-- This file contains sample INSERT statements for migrating data
-- Replace with actual data export from your Supabase instance

-- Note: Before running this script, ensure that:
-- 1. You have exported all data from your Supabase tables
-- 2. You have converted UUID formats if necessary
-- 3. You have handled any data type conversions

-- Sample data migration queries (replace with your actual data)

-- Example: Migrate employees data
-- INSERT INTO employees (id, emp_id, name, email, phone, user_id, password, manager, role, cluster, city, date_of_birth, date_of_joining, ifsc_code, account_number, blood_group, created_at, updated_at)
-- SELECT 
--     id,
--     emp_id,
--     name,
--     email,
--     phone,
--     user_id,
--     password,
--     manager,
--     role,
--     cluster,
--     city,
--     date_of_birth,
--     date_of_joining,
--     ifsc_code,
--     account_number,
--     blood_group,
--     created_at,
--     updated_at
-- FROM supabase_employees_export;

-- Example: Migrate dashboard users
-- INSERT INTO dashboard_users (id, name, email, employee_id, password, role, manager, cluster, city, phone, user_id, created_by, last_updated_by, created_at, updated_at)
-- SELECT 
--     id,
--     name,
--     email,
--     employee_id,
--     password,
--     role,
--     manager,
--     cluster,
--     city,
--     phone,
--     user_id,
--     created_by,
--     last_updated_by,
--     created_at,
--     updated_at
-- FROM supabase_dashboard_users_export;

-- Example: Migrate issues
-- INSERT INTO issues (id, employee_uuid, type_id, sub_type_id, description, status, priority, assigned_to, mapped_type_id, mapped_sub_type_id, mapped_by, mapped_at, closed_at, attachments, attachment_url, created_at, updated_at)
-- SELECT 
--     id,
--     employee_uuid,
--     type_id,
--     sub_type_id,
--     description,
--     status,
--     priority,
--     assigned_to,
--     mapped_type_id,
--     mapped_sub_type_id,
--     mapped_by,
--     mapped_at,
--     closed_at,
--     attachments,
--     attachment_url,
--     created_at,
--     updated_at
-- FROM supabase_issues_export;

-- Example: Migrate ticket feedback
-- INSERT INTO ticket_feedback (id, issue_id, employee_uuid, feedback_option, sentiment, city, cluster, agent_id, agent_name, created_at)
-- SELECT 
--     id,
--     issue_id,
--     employee_uuid,
--     feedback_option,
--     sentiment,
--     city,
--     cluster,
--     agent_id,
--     agent_name,
--     created_at
-- FROM supabase_ticket_feedback_export;

-- Add more migration queries for other tables as needed

-- Verify data migration
-- SELECT 'Data migration completed' as status;
-- SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = DATABASE() AND table_rows > 0;

COMMIT;
