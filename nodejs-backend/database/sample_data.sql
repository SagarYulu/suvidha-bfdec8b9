
-- Sample data for Grievance Portal

USE grievance_portal;

-- Insert sample cities
INSERT INTO master_cities (id, name) VALUES
('city-1', 'Mumbai'),
('city-2', 'Bangalore'),
('city-3', 'Delhi'),
('city-4', 'Chennai'),
('city-5', 'Hyderabad');

-- Insert sample clusters
INSERT INTO master_clusters (id, name, city_id) VALUES
('cluster-1', 'Zone A', 'city-1'),
('cluster-2', 'Zone B', 'city-1'),
('cluster-3', 'Tech Park', 'city-2'),
('cluster-4', 'Central Delhi', 'city-3'),
('cluster-5', 'IT Corridor', 'city-4');

-- Insert sample roles
INSERT INTO master_roles (id, name) VALUES
('role-1', 'Admin'),
('role-2', 'Manager'),
('role-3', 'Agent'),
('role-4', 'Employee');

-- Insert sample dashboard users (passwords are hashed versions of 'password123')
INSERT INTO dashboard_users (id, name, email, password, role, city, cluster) VALUES
('admin-1', 'Admin User', 'admin@yulu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMpYq3AAxuqNq/e', 'admin', 'Mumbai', 'Zone A'),
('manager-1', 'John Manager', 'john.manager@yulu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMpYq3AAxuqNq/e', 'manager', 'Bangalore', 'Tech Park'),
('agent-1', 'Sarah Agent', 'sarah.agent@yulu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMpYq3AAxuqNq/e', 'agent', 'Delhi', 'Central Delhi');

-- Insert sample employees
INSERT INTO employees (id, emp_id, name, email, password, role, city, cluster, manager) VALUES
('emp-1', 'EMP001', 'Raj Kumar', 'raj.kumar@yulu.com', 'EMP001', 'employee', 'Mumbai', 'Zone A', 'John Manager'),
('emp-2', 'EMP002', 'Priya Sharma', 'priya.sharma@yulu.com', 'EMP002', 'employee', 'Bangalore', 'Tech Park', 'John Manager'),
('emp-3', 'EMP003', 'Amit Singh', 'amit.singh@yulu.com', 'EMP003', 'employee', 'Delhi', 'Central Delhi', 'John Manager'),
('emp-4', 'EMP004', 'Sneha Patel', 'sneha.patel@yulu.com', 'EMP004', 'employee', 'Chennai', 'IT Corridor', 'John Manager');

-- Insert sample issues
INSERT INTO issues (id, employee_uuid, type_id, sub_type_id, description, status, priority) VALUES
('issue-1', 'emp-1', 'salary', 'salary-delay', 'My salary for this month has been delayed. Please help resolve this issue.', 'open', 'high'),
('issue-2', 'emp-2', 'bank-account', 'account-change', 'I need to update my bank account details due to account closure.', 'in_progress', 'medium'),
('issue-3', 'emp-3', 'others', 'general-inquiry', 'I have questions about the leave policy and annual benefits.', 'resolved', 'low'),
('issue-4', 'emp-4', 'salary', 'salary-deduction', 'There seems to be an incorrect deduction in my salary this month.', 'open', 'medium');

-- Insert sample comments
INSERT INTO issue_comments (id, issue_id, employee_uuid, content) VALUES
('comment-1', 'issue-1', 'emp-1', 'This is urgent as I have pending bills to pay.'),
('comment-2', 'issue-2', 'agent-1', 'Please submit your new bank account details with a canceled check.'),
('comment-3', 'issue-2', 'emp-2', 'I have uploaded the required documents. Please review.'),
('comment-4', 'issue-3', 'agent-1', 'The leave policy document has been shared via email. Please check.');

-- Update some issues with assignments
UPDATE issues SET assigned_to = 'agent-1' WHERE id IN ('issue-1', 'issue-2');
UPDATE issues SET assigned_to = 'manager-1' WHERE id = 'issue-3';
