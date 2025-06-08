
-- Create master data tables for windsurf development

-- Master Cities Table
CREATE TABLE IF NOT EXISTS master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Clusters Table
CREATE TABLE IF NOT EXISTS master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  city_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city_id (city_id),
  INDEX idx_name (name),
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cluster_per_city (city_id, name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Roles Table
CREATE TABLE IF NOT EXISTS master_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Master Audit Logs Table
CREATE TABLE IF NOT EXISTS master_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert some default master data

-- Default cities
INSERT IGNORE INTO master_cities (id, name) VALUES 
  (UUID(), 'Mumbai'),
  (UUID(), 'Delhi'),
  (UUID(), 'Bangalore'),
  (UUID(), 'Chennai'),
  (UUID(), 'Hyderabad'),
  (UUID(), 'Pune'),
  (UUID(), 'Kolkata');

-- Default roles
INSERT IGNORE INTO master_roles (id, name) VALUES 
  (UUID(), 'Admin'),
  (UUID(), 'Manager'),
  (UUID(), 'Team Lead'),
  (UUID(), 'Employee'),
  (UUID(), 'HR'),
  (UUID(), 'IT Support');
