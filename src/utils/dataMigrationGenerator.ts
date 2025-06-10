
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";

interface MigrationResult {
  tableName: string;
  insertStatements: string[];
  rowCount: number;
  errors?: string[];
}

export class DataMigrationGenerator {
  private escapeValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') {
      // Handle NaN and Infinity
      if (isNaN(value) || !isFinite(value)) return 'NULL';
      return String(value);
    }
    if (typeof value === 'object') {
      try {
        return `'${JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
      } catch (e) {
        return 'NULL';
      }
    }
    if (typeof value === 'string') {
      // Escape single quotes, backslashes, and handle special characters for MySQL
      return `'${value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "''")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")}'`;
    }
    return `'${String(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }

  private generateInsertStatement(tableName: string, data: any[]): string[] {
    if (!data || data.length === 0) return [`-- No data found for table: ${tableName}`];

    const statements: string[] = [];
    const columns = Object.keys(data[0]);
    
    statements.push(`-- Data migration for table: ${tableName}`);
    statements.push(`-- Total rows: ${data.length}`);
    statements.push('');
    
    // Generate INSERT statements in smaller batches for better MySQL compatibility
    const batchSize = 50; // Smaller batches for MySQL
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const values = batch.map(row => {
          const rowValues = columns.map(col => this.escapeValue(row[col]));
          return `(${rowValues.join(', ')})`;
        }).join(',\n  ');
        
        statements.push(
          `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n  ${values};`
        );
        statements.push(''); // Empty line for readability
      } catch (error) {
        statements.push(`-- Error generating INSERT for batch ${Math.floor(i/batchSize) + 1}: ${error}`);
      }
    }
    
    return statements;
  }

  private async extractTableData(tableName: string): Promise<MigrationResult> {
    console.log(`Extracting data from table: ${tableName}`);
    
    try {
      // Use a more robust query approach
      const { data, error, count } = await (supabase as any)
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error(`Error extracting ${tableName}:`, error);
        return {
          tableName,
          insertStatements: [`-- Error extracting data from ${tableName}: ${error.message}`],
          rowCount: 0,
          errors: [error.message]
        };
      }
      
      console.log(`✅ Successfully extracted ${data?.length || 0} rows from ${tableName}`);
      
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
        insertStatements: [`-- Error: Failed to extract data from ${tableName}: ${error}`],
        rowCount: 0,
        errors: [String(error)]
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
    let totalErrors = 0;

    console.log('Starting enhanced data migration generation...');

    for (const tableName of tables) {
      try {
        console.log(`Processing table: ${tableName}`);
        const result = await this.extractTableData(tableName);
        results.push(result);
        totalRows += result.rowCount;
        
        if (result.errors && result.errors.length > 0) {
          totalErrors += result.errors.length;
          console.warn(`⚠️ Errors in ${tableName}:`, result.errors);
        } else {
          console.log(`✅ Successfully processed ${result.rowCount} rows from ${tableName}`);
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Failed to process ${tableName}:`, error);
        totalErrors++;
        results.push({
          tableName,
          insertStatements: [`-- Critical Error: Failed to process ${tableName}: ${error}`],
          rowCount: 0,
          errors: [String(error)]
        });
      }
    }

    // Generate the complete migration script
    const migrationScript = this.buildMigrationScript(results, totalRows, totalErrors);
    
    // Download the migration script
    const blob = new Blob([migrationScript], { type: 'text/sql;charset=utf-8' });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `mysql_data_migration_enhanced_${timestamp}.sql`);

    console.log(`✅ Enhanced migration script generated!`);
    console.log(`📊 Total rows exported: ${totalRows}`);
    console.log(`⚠️ Total errors encountered: ${totalErrors}`);
    console.log(`📁 Downloaded as: mysql_data_migration_enhanced_${timestamp}.sql`);

    return;
  }

  private buildMigrationScript(results: MigrationResult[], totalRows: number, totalErrors: number): string {
    const timestamp = new Date().toISOString();
    const header = [
      '-- Enhanced MySQL Data Migration Script',
      `-- Generated on: ${timestamp}`,
      `-- Source: Supabase Database`,
      `-- Target: MySQL Database`,
      `-- Total tables: ${results.length}`,
      `-- Total rows: ${totalRows}`,
      `-- Errors encountered: ${totalErrors}`,
      '',
      '-- IMPORTANT NOTES:',
      '-- 1. Make sure your MySQL database schema is already created',
      '-- 2. Run this script in your MySQL database',
      '-- 3. This script will INSERT data into existing tables',
      '-- 4. This script includes enhanced error handling and MySQL compatibility',
      '-- 5. Review any error comments in the script before execution',
      '',
      '-- MySQL Configuration for better compatibility',
      'SET FOREIGN_KEY_CHECKS = 0;',
      'SET AUTOCOMMIT = 0;',
      'SET sql_mode = \'\';',
      'SET CHARACTER_SET_CLIENT = utf8mb4;',
      'SET CHARACTER_SET_CONNECTION = utf8mb4;',
      'SET CHARACTER_SET_RESULTS = utf8mb4;',
      'START TRANSACTION;',
      '',
      ''
    ].join('\n');

    const footer = [
      '',
      '-- Restore MySQL settings and commit transaction',
      'SET FOREIGN_KEY_CHECKS = 1;',
      'COMMIT;',
      '',
      `-- Enhanced migration completed!`,
      `-- Total rows inserted: ${totalRows}`,
      `-- Total errors: ${totalErrors}`,
      `-- Generated on: ${timestamp}`,
      '',
      '-- If you encountered errors, please check the error comments above',
      '-- and verify your MySQL schema matches the Supabase structure.'
    ].join('\n');

    const tableData = results.map(result => {
      const lines = result.insertStatements.join('\n');
      if (result.errors && result.errors.length > 0) {
        return `-- ERRORS IN TABLE ${result.tableName.toUpperCase()}:\n-- ${result.errors.join('\n-- ')}\n\n${lines}`;
      }
      return lines;
    }).join('\n\n');

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

    const report: string[] = [
      '-- Enhanced Database Migration Report', 
      '-- Generated on: ' + new Date().toISOString(), 
      '-- This report shows current data counts in Supabase',
      ''
    ];
    let totalRows = 0;

    for (const tableName of tables) {
      try {
        const { count, error } = await (supabase as any)
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          report.push(`-- Table: ${tableName.padEnd(30)} Rows: Error - ${error.message}`);
        } else {
          const rowCount = count || 0;
          totalRows += rowCount;
          report.push(`-- Table: ${tableName.padEnd(30)} Rows: ${rowCount}`);
        }
      } catch (error) {
        report.push(`-- Table: ${tableName.padEnd(30)} Rows: Critical Error`);
      }
    }

    report.push('', `-- Total rows across all tables: ${totalRows}`);
    report.push('', '-- NOTE: This report reflects current Supabase data counts');
    return report.join('\n');
  }
}
