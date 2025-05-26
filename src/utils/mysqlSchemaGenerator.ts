
export class MySQLSchemaGenerator {
  
  static generateCreateTableStatements(): string {
    const statements = [
      this.generateEmployeesTable(),
      this.generateDashboardUsersTable(),
      this.generateIssuesTable(),
      this.generateIssueCommentsTable(),
      this.generateIssueInternalCommentsTable(),
      this.generateIssueAuditTrailTable(),
      this.generateIssueNotificationsTable(),
      this.generateTicketFeedbackTable(),
      this.generateMasterCitiesTable(),
      this.generateMasterClustersTable(),
      this.generateMasterRolesTable(),
      this.generateRbacPermissionsTable(),
      this.generateRbacRolesTable(),
      this.generateRbacRolePermissionsTable(),
      this.generateRbacUserRolesTable(),
      this.generateDashboardUserAuditLogsTable(),
      this.generateMasterAuditLogsTable()
    ];

    return statements.join('\n\n');
  }

  private static generateEmployeesTable(): string {
    return `-- Table: employees
CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  emp_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  user_id VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  manager VARCHAR(255),
  role VARCHAR(100),
  cluster VARCHAR(100),
  city VARCHAR(100),
  date_of_joining DATE,
  blood_group VARCHAR(10),
  date_of_birth DATE,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  private static generateDashboardUsersTable(): string {
    return `-- Table: dashboard_users
CREATE TABLE dashboard_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(50),
  user_id VARCHAR(50),
  phone VARCHAR(20),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  last_updated_by VARCHAR(36)
);`;
  }

  private static generateIssuesTable(): string {
    return `-- Table: issues
CREATE TABLE issues (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_uuid VARCHAR(36) NOT NULL,
  type_id VARCHAR(50) NOT NULL,
  sub_type_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  assigned_to VARCHAR(36),
  mapped_type_id VARCHAR(50),
  mapped_sub_type_id VARCHAR(50),
  mapped_by VARCHAR(36),
  mapped_at TIMESTAMP NULL,
  attachments JSON,
  attachment_url TEXT
);`;
  }

  private static generateIssueCommentsTable(): string {
    return `-- Table: issue_comments
CREATE TABLE issue_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);`;
  }

  private static generateIssueInternalCommentsTable(): string {
    return `-- Table: issue_internal_comments
CREATE TABLE issue_internal_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);`;
  }

  private static generateIssueAuditTrailTable(): string {
    return `-- Table: issue_audit_trail
CREATE TABLE issue_audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);`;
  }

  private static generateIssueNotificationsTable(): string {
    return `-- Table: issue_notifications
CREATE TABLE issue_notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);`;
  }

  private static generateTicketFeedbackTable(): string {
    return `-- Table: ticket_feedback
CREATE TABLE ticket_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id VARCHAR(36) NOT NULL,
  employee_uuid VARCHAR(36) NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  feedback_option VARCHAR(100) NOT NULL,
  cluster VARCHAR(100),
  city VARCHAR(100),
  agent_id VARCHAR(36),
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);`;
  }

  private static generateMasterCitiesTable(): string {
    return `-- Table: master_cities
CREATE TABLE master_cities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  private static generateMasterClustersTable(): string {
    return `-- Table: master_clusters
CREATE TABLE master_clusters (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  city_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE
);`;
  }

  private static generateMasterRolesTable(): string {
    return `-- Table: master_roles
CREATE TABLE master_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  private static generateRbacPermissionsTable(): string {
    return `-- Table: rbac_permissions
CREATE TABLE rbac_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  private static generateRbacRolesTable(): string {
    return `-- Table: rbac_roles
CREATE TABLE rbac_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  private static generateRbacRolePermissionsTable(): string {
    return `-- Table: rbac_role_permissions
CREATE TABLE rbac_role_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);`;
  }

  private static generateRbacUserRolesTable(): string {
    return `-- Table: rbac_user_roles
CREATE TABLE rbac_user_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
);`;
  }

  private static generateDashboardUserAuditLogsTable(): string {
    return `-- Table: dashboard_user_audit_logs
CREATE TABLE dashboard_user_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  performed_by VARCHAR(36),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
  }

  private static generateMasterAuditLogsTable(): string {
    return `-- Table: master_audit_logs
CREATE TABLE master_audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
  }

  static downloadMySQLScript(): void {
    const sqlContent = `-- MySQL Database Schema for Yulu Suvidha Management
-- Generated on ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Create a new MySQL database
-- 2. Run this script to create all tables
-- 3. Import your data using the CSV files or SQL inserts from the export
-- 4. Update your backend configuration to connect to this MySQL database

SET FOREIGN_KEY_CHECKS = 0;

${this.generateCreateTableStatements()}

SET FOREIGN_KEY_CHECKS = 1;

-- Create indexes for better performance
CREATE INDEX idx_issues_employee_uuid ON issues(employee_uuid);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX idx_ticket_feedback_issue_id ON ticket_feedback(issue_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);

-- Insert basic RBAC roles and permissions (optional)
INSERT INTO rbac_roles (id, name, description) VALUES 
  (UUID(), 'admin', 'Full system administrator'),
  (UUID(), 'employee', 'Regular employee user'),
  (UUID(), 'manager', 'Team manager with additional permissions');

INSERT INTO rbac_permissions (id, name, description) VALUES 
  (UUID(), 'view_dashboard', 'Can view admin dashboard'),
  (UUID(), 'manage_users', 'Can create and manage users'),
  (UUID(), 'manage_issues', 'Can assign and manage issues'),
  (UUID(), 'view_analytics', 'Can view analytics and reports');
`;

    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mysql_schema_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
