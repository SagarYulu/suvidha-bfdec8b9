
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";
import type { Database } from "@/integrations/supabase/types";
import { MySQLSchemaGenerator } from "./mysqlSchemaGenerator";

type TableName = keyof Database['public']['Tables'];

export interface ExportResult {
  tableName: string;
  data: any[];
  count: number;
}

export class DatabaseExporter {
  private async exportTable(tableName: TableName): Promise<ExportResult> {
    console.log(`Exporting table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
      throw new Error(`Failed to export ${tableName}: ${error.message}`);
    }
    
    return {
      tableName,
      data: data || [],
      count: data?.length || 0
    };
  }

  private convertToCSV(data: any[], headers: string[]): string {
    if (data.length === 0) return headers.join(',') + '\n';
    
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  private downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  }

  private generateSQLInserts(tableName: string, data: any[]): string {
    if (data.length === 0) return `-- No data in ${tableName}\n`;
    
    const columns = Object.keys(data[0]);
    let sql = `-- Data for table: ${tableName}\n`;
    
    for (const row of data) {
      const values = columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return String(value);
      });
      
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    
    return sql + '\n';
  }

  async exportAllTables(): Promise<ExportResult[]> {
    const tables: TableName[] = [
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

    const results: ExportResult[] = [];
    
    for (const tableName of tables) {
      try {
        const result = await this.exportTable(tableName);
        results.push(result);
        console.log(`✅ Exported ${result.count} records from ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to export ${tableName}:`, error);
        results.push({
          tableName,
          data: [],
          count: 0
        });
      }
    }
    
    return results;
  }

  async exportAsCSVFiles(results: ExportResult[]): Promise<void> {
    for (const result of results) {
      if (result.data.length > 0) {
        const headers = Object.keys(result.data[0]);
        const csvContent = this.convertToCSV(result.data, headers);
        this.downloadCSV(`${result.tableName}.csv`, csvContent);
      } else {
        // Create empty CSV with just headers if possible
        this.downloadCSV(`${result.tableName}.csv`, `# No data in ${result.tableName}\n`);
      }
    }
  }

  async exportAsSQLFile(results: ExportResult[]): Promise<void> {
    let sqlContent = `-- Database Export - Generated on ${new Date().toISOString()}\n`;
    sqlContent += `-- Total tables exported: ${results.length}\n\n`;
    
    for (const result of results) {
      sqlContent += this.generateSQLInserts(result.tableName, result.data);
    }
    
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    saveAs(blob, `database_export_${new Date().toISOString().split('T')[0]}.sql`);
  }

  async exportAsJSON(results: ExportResult[]): Promise<void> {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTables: results.length,
      totalRecords: results.reduce((sum, r) => sum + r.count, 0),
      tables: results.reduce((acc, result) => {
        acc[result.tableName] = result.data;
        return acc;
      }, {} as Record<string, any[]>)
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `database_export_${new Date().toISOString().split('T')[0]}.json`);
  }

  async exportAsCompleteSQLScript(results: ExportResult[]): Promise<void> {
    let sqlContent = `-- Complete MySQL Database Script
-- Generated on ${new Date().toISOString()}
-- 
-- This script creates all tables and inserts all data in one go
-- Instructions:
-- 1. Create a new MySQL database
-- 2. Run this complete script in your MySQL database
-- 3. All tables will be created and populated with data

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ========================================
-- CREATE TABLES
-- ========================================

${MySQLSchemaGenerator.generateCreateTableStatements()}

-- ========================================
-- INSERT DATA
-- ========================================

`;

    for (const result of results) {
      if (result.data.length > 0) {
        sqlContent += `\n-- Inserting data into ${result.tableName}\n`;
        sqlContent += this.generateSQLInserts(result.tableName, result.data);
      }
    }

    sqlContent += `
-- ========================================
-- FINALIZE
-- ========================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- Script completed successfully!
-- Total tables: ${results.length}
-- Total records: ${results.reduce((sum, r) => sum + r.count, 0)}
`;

    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    saveAs(blob, `complete_mysql_script_${new Date().toISOString().split('T')[0]}.sql`);
  }

  // New method to directly generate complete script without needing export first
  async downloadCompleteMySQLScriptDirect(): Promise<void> {
    try {
      console.log('Starting direct complete MySQL script generation...');
      const results = await this.exportAllTables();
      await this.exportAsCompleteSQLScript(results);
      console.log('Complete MySQL script generated successfully!');
    } catch (error) {
      console.error('Failed to generate complete MySQL script:', error);
      throw error;
    }
  }
}
