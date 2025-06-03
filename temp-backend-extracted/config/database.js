
// Database Configuration
// Based on your current Supabase database schema

class DatabaseConfig {
  constructor() {
    this.tables = {
      employees: {
        columns: [
          'id', 'emp_id', 'name', 'email', 'phone', 'user_id', 'password',
          'manager', 'role', 'cluster', 'city', 'date_of_joining',
          'blood_group', 'date_of_birth', 'account_number', 'ifsc_code',
          'created_at', 'updated_at'
        ]
      },
      dashboard_users: {
        columns: [
          'id', 'name', 'email', 'employee_id', 'user_id', 'phone',
          'city', 'cluster', 'manager', 'role', 'password',
          'created_at', 'updated_at', 'created_by', 'last_updated_by'
        ]
      },
      issues: {
        columns: [
          'id', 'employee_uuid', 'type_id', 'sub_type_id', 'description',
          'status', 'priority', 'created_at', 'updated_at', 'closed_at',
          'assigned_to', 'mapped_type_id', 'mapped_sub_type_id',
          'mapped_by', 'mapped_at', 'attachments', 'attachment_url'
        ]
      },
      issue_comments: {
        columns: [
          'id', 'issue_id', 'employee_uuid', 'content', 'created_at'
        ]
      },
      issue_internal_comments: {
        columns: [
          'id', 'issue_id', 'employee_uuid', 'content', 'created_at', 'updated_at'
        ]
      },
      issue_audit_trail: {
        columns: [
          'id', 'issue_id', 'employee_uuid', 'action', 'previous_status',
          'new_status', 'details', 'created_at'
        ]
      },
      ticket_feedback: {
        columns: [
          'id', 'issue_id', 'employee_uuid', 'sentiment', 'feedback_option',
          'cluster', 'city', 'agent_id', 'agent_name', 'created_at'
        ]
      },
      rbac_roles: {
        columns: ['id', 'name', 'description', 'created_at', 'updated_at']
      },
      rbac_permissions: {
        columns: ['id', 'name', 'description', 'created_at', 'updated_at']
      },
      rbac_user_roles: {
        columns: ['id', 'user_id', 'role_id', 'created_at']
      },
      rbac_role_permissions: {
        columns: ['id', 'role_id', 'permission_id', 'created_at']
      }
    };
  }

  // SQL Schema for creating tables
  getCreateTableStatements() {
    return {
      employees: `
        CREATE TABLE employees (
          id VARCHAR(36) PRIMARY KEY,
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
        )
      `,
      dashboard_users: `
        CREATE TABLE dashboard_users (
          id VARCHAR(36) PRIMARY KEY,
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
        )
      `,
      issues: `
        CREATE TABLE issues (
          id VARCHAR(36) PRIMARY KEY,
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
        )
      `,
      issue_comments: `
        CREATE TABLE issue_comments (
          id VARCHAR(36) PRIMARY KEY,
          issue_id VARCHAR(36) NOT NULL,
          employee_uuid VARCHAR(36) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
        )
      `,
      issue_audit_trail: `
        CREATE TABLE issue_audit_trail (
          id VARCHAR(36) PRIMARY KEY,
          issue_id VARCHAR(36) NOT NULL,
          employee_uuid VARCHAR(36) NOT NULL,
          action VARCHAR(100) NOT NULL,
          previous_status VARCHAR(50),
          new_status VARCHAR(50),
          details JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
        )
      `,
      ticket_feedback: `
        CREATE TABLE ticket_feedback (
          id VARCHAR(36) PRIMARY KEY,
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
        )
      `
    };
  }
}

module.exports = { DatabaseConfig };
