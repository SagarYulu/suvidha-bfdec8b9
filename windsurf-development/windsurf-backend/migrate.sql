
-- Create file_uploads table for managing uploaded files
CREATE TABLE IF NOT EXISTS file_uploads (
  id VARCHAR(36) PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL UNIQUE,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'attachments',
  uploaded_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_file_uploads_uploaded_by (uploaded_by),
  INDEX idx_file_uploads_category (category),
  INDEX idx_file_uploads_created_at (created_at)
);

-- Create RBAC tables if they don't exist
CREATE TABLE IF NOT EXISTS rbac_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rbac_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rbac_user_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_role (user_id, role_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  INDEX idx_user_roles_user_id (user_id),
  INDEX idx_user_roles_role_id (role_id)
);

CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  INDEX idx_role_permissions_role_id (role_id),
  INDEX idx_role_permissions_permission_id (permission_id)
);

-- Insert default roles
INSERT IGNORE INTO rbac_roles (id, name, description) VALUES
(UUID(), 'admin', 'System administrator with full access'),
(UUID(), 'manager', 'Manager with user and issue management access'),
(UUID(), 'agent', 'Support agent with issue handling access'),
(UUID(), 'employee', 'Regular employee with basic access');

-- Insert default permissions
INSERT IGNORE INTO rbac_permissions (id, name, description) VALUES
(UUID(), 'users:create', 'Create new users'),
(UUID(), 'users:read', 'View user information'),
(UUID(), 'users:update', 'Update user information'),
(UUID(), 'users:delete', 'Delete users'),
(UUID(), 'issues:create', 'Create new issues'),
(UUID(), 'issues:read', 'View issues'),
(UUID(), 'issues:update', 'Update issues'),
(UUID(), 'issues:delete', 'Delete issues'),
(UUID(), 'issues:assign', 'Assign issues to users'),
(UUID(), 'dashboard:access', 'Access admin dashboard'),
(UUID(), 'analytics:view', 'View analytics and reports'),
(UUID(), 'files:upload', 'Upload files'),
(UUID(), 'files:delete', 'Delete files');

-- Assign permissions to roles
INSERT IGNORE INTO rbac_role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'admin'; -- Admin gets all permissions

INSERT IGNORE INTO rbac_role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'manager' AND p.name IN (
  'users:read', 'users:update', 'issues:create', 'issues:read', 
  'issues:update', 'issues:assign', 'dashboard:access', 'analytics:view', 'files:upload'
);

INSERT IGNORE INTO rbac_role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'agent' AND p.name IN (
  'issues:read', 'issues:update', 'issues:assign', 'dashboard:access', 'files:upload'
);

INSERT IGNORE INTO rbac_role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'employee' AND p.name IN (
  'issues:create', 'issues:read', 'files:upload'
);
