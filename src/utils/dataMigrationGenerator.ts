
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";

interface MigrationResult {
  tableName: string;
  insertStatements: string[];
  rowCount: number;
}

export class DataMigrationGenerator {
  private escapeValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    if (typeof value === 'string') {
      // Escape single quotes and handle special characters
      return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  private generateInsertStatement(tableName: string, data: any[]): string[] {
    if (!data || data.length === 0) return [`-- No data found for table: ${tableName}`];

    const statements: string[] = [];
    const columns = Object.keys(data[0]);
    
    statements.push(`-- Data migration for table: ${tableName}`);
    statements.push(`-- Total rows: ${data.length}`);
    
    // Generate INSERT statements in batches of 100 for better performance
    for (let i = 0; i < data.length; i += 100) {
      const batch = data.slice(i, i + 100);
      const values = batch.map(row => {
        const rowValues = columns.map(col => this.escapeValue(row[col]));
        return `(${rowValues.join(', ')})`;
      }).join(',\n  ');
      
      statements.push(
        `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n  ${values};`
      );
    }
    
    statements.push(''); // Empty line for readability
    return statements;
  }

  private async extractTableData(tableName: string): Promise<MigrationResult> {
    console.log(`Extracting data from table: ${tableName}`);
    
    try {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*');
      
      if (error) {
        console.error(`Error extracting ${tableName}:`, error);
        return {
          tableName,
          insertStatements: [`-- Error extracting data from ${tableName}: ${error.message}`],
          rowCount: 0
        };
      }
      
      const insertStatements = this.generateInsertStatement(tableName, data || []);
      
      return {
        tableName,
        insertStatements,
        rowCount: data?.length || 0
      };
    } catch (error) {
      console.error(`Failed to extract ${tableName}:`, error);
      return {
        tableName,
        insertStatements: [`-- Error: Failed to extract data from ${tableName}`],
        rowCount: 0
      };
    }
  }

  async generateCompleteMigration(): Promise<void> {
    const tables = [
      'employees',
      'issues',
      'dashboard_users',
      'issue_comments',
      'issue_internal_comments',
      'issue_audit_trail',
      'issue_notifications',
      'ticket_feedback',
      'master_cities',
      'master_clusters',
      'master_roles',
      'rbac_permissions',
      'rbac_roles',
      'rbac_role_permissions',
      'rbac_user_roles',
      'dashboard_user_audit_logs',
      'master_audit_logs'
    ];

    const results: MigrationResult[] = [];
    let totalRows = 0;

    console.log('Starting data migration generation...');

    for (const tableName of tables) {
      try {
        const result = await this.extractTableData(tableName);
        results.push(result);
        totalRows += result.rowCount;
        console.log(`✅ Extracted ${result.rowCount} rows from ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to extract ${tableName}:`, error);
        results.push({
          tableName,
          insertStatements: [`-- Error: Failed to extract data from ${tableName}`],
          rowCount: 0
        });
      }
    }

    // Generate the complete migration script
    const migrationScript = this.buildMigrationScript(results, totalRows);
    
    // Download the migration script
    const blob = new Blob([migrationScript], { type: 'text/sql;charset=utf-8' });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `mysql_data_migration_${timestamp}.sql`);

    console.log(`✅ Migration script generated successfully!`);
    console.log(`📊 Total rows exported: ${totalRows}`);
    console.log(`📁 Downloaded as: mysql_data_migration_${timestamp}.sql`);

    return;
  }

  private buildMigrationScript(results: MigrationResult[], totalRows: number): string {
    const timestamp = new Date().toISOString();
    const header = [
      '-- MySQL Data Migration Script',
      `-- Generated on: ${timestamp}`,
      `-- Source: Supabase Database`,
      `-- Target: MySQL Database`,
      `-- Total tables: ${results.length}`,
      `-- Total rows: ${totalRows}`,
      '',
      '-- IMPORTANT NOTES:',
      '-- 1. Make sure your MySQL database schema is already created',
      '-- 2. Run this script in your MySQL database',
      '-- 3. This script will INSERT data into existing tables',
      '-- 4. Make sure tables are empty before running this script',
      '',
      'SET FOREIGN_KEY_CHECKS = 0;',
      'SET AUTOCOMMIT = 0;',
      'START TRANSACTION;',
      '',
      ''
    ].join('\n');

    const footer = [
      '',
      '-- Enable foreign key checks and commit transaction',
      'SET FOREIGN_KEY_CHECKS = 1;',
      'COMMIT;',
      '',
      `-- Migration completed successfully!`,
      `-- Total rows inserted: ${totalRows}`,
      `-- Generated on: ${timestamp}`
    ].join('\n');

    const tableData = results.map(result => result.insertStatements.join('\n')).join('\n\n');

    return header + tableData + footer;
  }

  async generateTableReport(): Promise<string> {
    const tables = [
      'employees', 'issues', 'dashboard_users', 'issue_comments',
      'issue_internal_comments', 'issue_audit_trail', 'issue_notifications',
      'ticket_feedback', 'master_cities', 'master_clusters', 'master_roles',
      'rbac_permissions', 'rbac_roles', 'rbac_role_permissions',
      'rbac_user_roles', 'dashboard_user_audit_logs', 'master_audit_logs'
    ];

    const report: string[] = ['-- Database Migration Report', '-- Generated on: ' + new Date().toISOString(), ''];
    let totalRows = 0;

    for (const tableName of tables) {
      try {
        const { data } = await (supabase as any).from(tableName).select('*', { count: 'exact', head: true });
        const count = data?.length || 0;
        totalRows += count;
        report.push(`-- Table: ${tableName.padEnd(30)} Rows: ${count}`);
      } catch (error) {
        report.push(`-- Table: ${tableName.padEnd(30)} Rows: Error`);
      }
    }

    report.push('', `-- Total rows across all tables: ${totalRows}`);
    return report.join('\n');
  }
}
