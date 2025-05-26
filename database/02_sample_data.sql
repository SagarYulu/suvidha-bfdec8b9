
-- Sample Data for Yulu Grievance Portal
-- Execute this after running 01_schema.sql

-- Insert RBAC roles
INSERT INTO rbac_roles (id, name, description) VALUES 
('role-admin', 'admin', 'Full system administrator'),
('role-manager', 'manager', 'Team manager with issue management permissions'),
('role-agent', 'agent', 'Support agent with limited permissions'),
('role-employee', 'employee', 'Regular employee user');

-- Insert RBAC permissions
INSERT INTO rbac_permissions (id, name, description) VALUES 
('perm-view-dashboard', 'view_dashboard', 'Can view admin dashboard'),
('perm-manage-users', 'manage_users', 'Can create and manage users'),
('perm-manage-issues', 'manage_issues', 'Can assign and manage issues'),
('perm-view-analytics', 'view_analytics', 'Can view analytics and reports'),
('perm-export-data', 'export_data', 'Can export system data'),
('perm-manage-rbac', 'manage_rbac', 'Can manage roles and permissions');

-- Assign permissions to roles
INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES 
-- Admin gets all permissions
('role-admin', 'perm-view-dashboard'),
('role-admin', 'perm-manage-users'),
('role-admin', 'perm-manage-issues'),
('role-admin', 'perm-view-analytics'),
('role-admin', 'perm-export-data'),
('role-admin', 'perm-manage-rbac'),
-- Manager gets most permissions except RBAC
('role-manager', 'perm-view-dashboard'),
('role-manager', 'perm-manage-issues'),
('role-manager', 'perm-view-analytics'),
('role-manager', 'perm-export-data'),
-- Agent gets basic permissions
('role-agent', 'perm-view-dashboard'),
('role-agent', 'perm-manage-issues');

-- Insert sample cities
INSERT INTO master_cities (id, name) VALUES
('city-delhi', 'Delhi'),
('city-mumbai', 'Mumbai'),
('city-bangalore', 'Bangalore'),
('city-gurgaon', 'Gurgaon'),
('city-pune', 'Pune');

-- Insert sample clusters
INSERT INTO master_clusters (id, name, city_id) VALUES
('cluster-central-delhi', 'Central Delhi', 'city-delhi'),
('cluster-south-delhi', 'South Delhi', 'city-delhi'),
('cluster-south-mumbai', 'South Mumbai', 'city-mumbai'),
('cluster-hsr-layout', 'HSR Layout', 'city-bangalore'),
('cluster-koramangala', 'Koramangala', 'city-bangalore'),
('cluster-sector-18', 'Sector 18', 'city-gurgaon');

-- Insert sample dashboard users (password is 'password' hashed with bcrypt)
INSERT INTO dashboard_users (id, name, email, role, password, is_active, city, cluster) VALUES
('admin-uuid-1', 'Super Admin', 'admin@yulu.com', 'admin', '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O', TRUE, 'Delhi', 'Central Delhi'),
('manager-uuid-1', 'Manager One', 'manager1@yulu.com', 'manager', '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O', TRUE, 'Delhi', 'Central Delhi'),
('manager-uuid-2', 'Manager Two', 'manager2@yulu.com', 'manager', '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O', TRUE, 'Mumbai', 'South Mumbai'),
('agent-uuid-1', 'Support Agent One', 'agent1@yulu.com', 'agent', '$2a$10$rOZJAWvhYqp8zVPm4G5qYuJXH4dN0A.8n1R8F4kV3QzZ2K5lW3R1O', TRUE, 'Bangalore', 'HSR Layout');

-- Assign roles to users
INSERT INTO rbac_user_roles (user_id, role_id) VALUES 
('admin-uuid-1', 'role-admin'),
('manager-uuid-1', 'role-manager'),
('manager-uuid-2', 'role-manager'),
('agent-uuid-1', 'role-agent');

-- Insert sample employees (password is 'password' hashed with bcrypt)
INSERT INTO employees (employee_uuid, employee_id, employee_name, employee_email, manager_name, role, cluster, city, date_of_joining, phone) VALUES
(UUID(), 'EMP001', 'John Doe', 'john.doe@yulu.com', 'Manager One', 'Delivery Executive', 'Central Delhi', 'Delhi', '2023-01-15', '+91-9876543210'),
(UUID(), 'EMP002', 'Jane Smith', 'jane.smith@yulu.com', 'Manager One', 'Operations Executive', 'South Mumbai', 'Mumbai', '2023-02-20', '+91-9876543211'),
(UUID(), 'EMP003', 'Rajesh Kumar', 'rajesh.kumar@yulu.com', 'Manager Two', 'Delivery Executive', 'HSR Layout', 'Bangalore', '2023-03-10', '+91-9876543212'),
(UUID(), 'EMP004', 'Priya Sharma', 'priya.sharma@yulu.com', 'Manager One', 'Customer Support', 'Sector 18', 'Gurgaon', '2023-04-05', '+91-9876543213'),
(UUID(), 'EMP005', 'Amit Patel', 'amit.patel@yulu.com', 'Manager Two', 'Delivery Executive', 'Koramangala', 'Bangalore', '2023-05-15', '+91-9876543214'),
(UUID(), 'EMP006', 'Sneha Reddy', 'sneha.reddy@yulu.com', 'Manager One', 'Field Executive', 'Central Delhi', 'Delhi', '2023-06-01', '+91-9876543215'),
(UUID(), 'EMP007', 'Vikram Singh', 'vikram.singh@yulu.com', 'Manager Two', 'Delivery Executive', 'South Mumbai', 'Mumbai', '2023-07-10', '+91-9876543216');

-- Note: Sample issues will be empty initially
-- The application will create issues through the UI
