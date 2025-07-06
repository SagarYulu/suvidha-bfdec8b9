
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const csv = require('csv-parser');
const fs = require('fs');

class BulkUploadService {
  static async processEmployeeBulkUpload(filePath, uploadedBy) {
    const pool = getPool();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    try {
      const employees = await this.parseCSV(filePath);
      
      for (const [index, employee] of employees.entries()) {
        try {
          await this.validateAndCreateEmployee(employee, pool);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: index + 1,
            data: employee,
            error: error.message
          });
        }
      }
      
      // Log bulk upload activity
      await this.logBulkUploadActivity(uploadedBy, 'employees', results, pool);
      
      return results;
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  }

  static async processIssuesBulkUpload(filePath, uploadedBy) {
    const pool = getPool();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    try {
      const issues = await this.parseCSV(filePath);
      
      for (const [index, issue] of issues.entries()) {
        try {
          await this.validateAndCreateIssue(issue, pool);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: index + 1,
            data: issue,
            error: error.message
          });
        }
      }
      
      // Log bulk upload activity
      await this.logBulkUploadActivity(uploadedBy, 'issues', results, pool);
      
      return results;
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  }

  static async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  static async validateAndCreateEmployee(employeeData, pool) {
    const requiredFields = ['emp_name', 'emp_email', 'emp_code'];
    
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check if employee already exists
    const [existing] = await pool.execute(
      'SELECT id FROM employees WHERE emp_email = ? OR emp_code = ?',
      [employeeData.emp_email, employeeData.emp_code]
    );
    
    if (existing.length > 0) {
      throw new Error(`Employee with email ${employeeData.emp_email} or code ${employeeData.emp_code} already exists`);
    }
    
    // Create employee
    const employeeId = uuidv4();
    await pool.execute(
      `INSERT INTO employees 
       (id, emp_name, emp_email, emp_code, emp_mobile, cluster_id, role, password, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        employeeId,
        employeeData.emp_name,
        employeeData.emp_email,
        employeeData.emp_code,
        employeeData.emp_mobile || null,
        employeeData.cluster_id || null,
        employeeData.role || 'employee',
        employeeData.password || 'defaultPassword123'
      ]
    );
    
    return employeeId;
  }

  static async validateAndCreateIssue(issueData, pool) {
    const requiredFields = ['description', 'issue_type', 'issue_subtype', 'employee_id', 'created_by'];
    
    for (const field of requiredFields) {
      if (!issueData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate employee exists
    const [employee] = await pool.execute(
      'SELECT id FROM employees WHERE id = ? OR emp_code = ?',
      [issueData.employee_id, issueData.employee_id]
    );
    
    if (employee.length === 0) {
      throw new Error(`Employee not found: ${issueData.employee_id}`);
    }
    
    // Create issue
    const issueId = uuidv4();
    await pool.execute(
      `INSERT INTO issues 
       (id, title, description, issue_type, issue_subtype, priority, employee_id, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        issueId,
        issueData.title || `Issue: ${issueData.issue_type}`,
        issueData.description,
        issueData.issue_type,
        issueData.issue_subtype,
        issueData.priority || 'medium',
        employee[0].id,
        issueData.created_by
      ]
    );
    
    return issueId;
  }

  static async logBulkUploadActivity(userId, type, results, pool) {
    const logId = uuidv4();
    
    await pool.execute(
      `INSERT INTO dashboard_user_audit_logs 
       (id, entity_type, entity_id, action, changes, performed_by, performed_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        logId,
        'bulk_upload',
        logId,
        `bulk_upload_${type}`,
        JSON.stringify(results),
        userId
      ]
    );
  }

  static async getBulkUploadHistory(userId, limit = 20) {
    const pool = getPool();
    
    const [history] = await pool.execute(
      `SELECT * FROM dashboard_user_audit_logs 
       WHERE entity_type = 'bulk_upload' AND performed_by = ?
       ORDER BY performed_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    
    return history;
  }
}

module.exports = BulkUploadService;
