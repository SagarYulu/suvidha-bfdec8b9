
-- Migration script to import data from Supabase to MySQL
-- This is a template script - you'll need to export your Supabase data first

-- Step 1: Export data from Supabase (run these commands in Supabase SQL editor)
/*
-- Export employees
COPY (SELECT * FROM employees) TO '/tmp/employees.csv' WITH CSV HEADER;

-- Export dashboard_users  
COPY (SELECT * FROM dashboard_users) TO '/tmp/dashboard_users.csv' WITH CSV HEADER;

-- Export issues
COPY (SELECT * FROM issues) TO '/tmp/issues.csv' WITH CSV HEADER;

-- Export issue_comments
COPY (SELECT * FROM issue_comments) TO '/tmp/issue_comments.csv' WITH CSV HEADER;

-- Export issue_internal_comments
COPY (SELECT * FROM issue_internal_comments) TO '/tmp/issue_internal_comments.csv' WITH CSV HEADER;

-- Export issue_audit_trail
COPY (SELECT * FROM issue_audit_trail) TO '/tmp/issue_audit_trail.csv' WITH CSV HEADER;

-- Export ticket_feedback
COPY (SELECT * FROM ticket_feedback) TO '/tmp/ticket_feedback.csv' WITH CSV HEADER;

-- Export master data
COPY (SELECT * FROM master_cities) TO '/tmp/master_cities.csv' WITH CSV HEADER;
COPY (SELECT * FROM master_clusters) TO '/tmp/master_clusters.csv' WITH CSV HEADER;

-- Export RBAC data
COPY (SELECT * FROM rbac_roles) TO '/tmp/rbac_roles.csv' WITH CSV HEADER;
COPY (SELECT * FROM rbac_permissions) TO '/tmp/rbac_permissions.csv' WITH CSV HEADER;
COPY (SELECT * FROM rbac_role_permissions) TO '/tmp/rbac_role_permissions.csv' WITH CSV HEADER;
COPY (SELECT * FROM rbac_user_roles) TO '/tmp/rbac_user_roles.csv' WITH CSV HEADER;
*/

-- Step 2: Import data into MySQL (after downloading CSV files)
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Import master data first (no dependencies)
LOAD DATA LOCAL INFILE 'master_cities.csv'
INTO TABLE master_cities
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'master_clusters.csv'
INTO TABLE master_clusters
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Import RBAC data
LOAD DATA LOCAL INFILE 'rbac_roles.csv'
INTO TABLE rbac_roles
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'rbac_permissions.csv'
INTO TABLE rbac_permissions
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'rbac_role_permissions.csv'
INTO TABLE rbac_role_permissions
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Import users and employees
LOAD DATA LOCAL INFILE 'employees.csv'
INTO TABLE employees
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'dashboard_users.csv'
INTO TABLE dashboard_users
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'rbac_user_roles.csv'
INTO TABLE rbac_user_roles
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Import issues and related data
LOAD DATA LOCAL INFILE 'issues.csv'
INTO TABLE issues
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'issue_comments.csv'
INTO TABLE issue_comments
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'issue_internal_comments.csv'
INTO TABLE issue_internal_comments
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'issue_audit_trail.csv'
INTO TABLE issue_audit_trail
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'ticket_feedback.csv'
INTO TABLE ticket_feedback
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify data migration
SELECT 'Migration Summary:' as info;
SELECT 'Employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 'Dashboard Users', COUNT(*) FROM dashboard_users
UNION ALL
SELECT 'Issues', COUNT(*) FROM issues
UNION ALL
SELECT 'Issue Comments', COUNT(*) FROM issue_comments
UNION ALL
SELECT 'Ticket Feedback', COUNT(*) FROM ticket_feedback
UNION ALL
SELECT 'Master Cities', COUNT(*) FROM master_cities
UNION ALL
SELECT 'Master Clusters', COUNT(*) FROM master_clusters;

SELECT 'Migration completed successfully!' as status;
