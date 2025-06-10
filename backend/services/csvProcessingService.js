
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

class CSVProcessingService {
  static async processDashboardUsersCSV(fileBuffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowIndex = 0;

      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowIndex++;
          try {
            const processedRow = this.validateDashboardUserRow(row, rowIndex);
            if (processedRow.isValid) {
              results.push(processedRow.data);
            } else {
              errors.push({
                row: rowIndex,
                errors: processedRow.errors,
                data: row
              });
            }
          } catch (error) {
            errors.push({
              row: rowIndex,
              errors: [`Processing error: ${error.message}`],
              data: row
            });
          }
        })
        .on('end', () => {
          resolve({
            validUsers: results,
            invalidRows: errors,
            totalRows: rowIndex
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static validateDashboardUserRow(row, rowIndex) {
    const errors = [];
    const requiredFields = ['User ID', 'name', 'email', 'employee_id', 'phone', 'city', 'cluster', 'manager', 'role', 'password'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (row.email && !emailRegex.test(row.email)) {
      errors.push('Invalid email format');
    }

    // Validate User ID (should be numeric)
    if (row['User ID'] && !/^\d+$/.test(row['User ID'])) {
      errors.push('User ID must be numeric');
    }

    // Validate role
    const validRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin'];
    if (row.role && !validRoles.includes(row.role)) {
      errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Validate phone number
    if (row.phone && !/^\d{10}$/.test(row.phone.replace(/\D/g, ''))) {
      errors.push('Phone number must be 10 digits');
    }

    // Validate password length
    if (row.password && row.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    const processedData = {
      user_id: row['User ID'],
      name: row.name?.trim(),
      email: row.email?.trim().toLowerCase(),
      employee_id: row.employee_id?.trim(),
      phone: row.phone?.trim(),
      city: row.city?.trim(),
      cluster: row.cluster?.trim(),
      manager: row.manager?.trim(),
      role: row.role?.trim(),
      password: row.password?.trim()
    };

    return {
      isValid: errors.length === 0,
      errors,
      data: processedData
    };
  }

  static async processEmployeesCSV(fileBuffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowIndex = 0;

      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowIndex++;
          try {
            const processedRow = this.validateEmployeeRow(row, rowIndex);
            if (processedRow.isValid) {
              results.push(processedRow.data);
            } else {
              errors.push({
                row: rowIndex,
                errors: processedRow.errors,
                data: row
              });
            }
          } catch (error) {
            errors.push({
              row: rowIndex,
              errors: [`Processing error: ${error.message}`],
              data: row
            });
          }
        })
        .on('end', () => {
          resolve({
            validEmployees: results,
            invalidRows: errors,
            totalRows: rowIndex
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static validateEmployeeRow(row, rowIndex) {
    const errors = [];
    const requiredFields = ['User ID', 'emp_id', 'name', 'email', 'role'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (row.email && !emailRegex.test(row.email)) {
      errors.push('Invalid email format');
    }

    // Validate User ID
    if (row['User ID'] && !/^\d+$/.test(row['User ID'])) {
      errors.push('User ID must be numeric');
    }

    const processedData = {
      user_id: row['User ID'],
      emp_id: row.emp_id?.trim(),
      name: row.name?.trim(),
      email: row.email?.trim().toLowerCase(),
      phone: row.phone?.trim() || null,
      city: row.city?.trim() || null,
      cluster: row.cluster?.trim() || null,
      manager: row.manager?.trim() || null,
      role: row.role?.trim(),
      date_of_joining: row.date_of_joining?.trim() || null,
      date_of_birth: row.date_of_birth?.trim() || null,
      blood_group: row.blood_group?.trim() || null,
      account_number: row.account_number?.trim() || null,
      ifsc_code: row.ifsc_code?.trim() || null,
      password: row.password?.trim() || 'changeme123'
    };

    return {
      isValid: errors.length === 0,
      errors,
      data: processedData
    };
  }

  static generateCSVTemplate(type) {
    const templates = {
      dashboard_users: [
        'User ID,name,email,employee_id,phone,city,cluster,manager,role,password',
        '1234567,John Doe,john@example.com,EMP001,9876543210,Bangalore,Koramangala,Jane Smith,City Head,changeme123',
        '2345678,Jane Smith,jane@example.com,EMP002,9876543211,Delhi,GURGAON,Mark Johnson,HR Admin,changeme123'
      ].join('\n'),
      
      employees: [
        'User ID,emp_id,name,email,phone,city,cluster,manager,role,date_of_joining,date_of_birth,blood_group,account_number,ifsc_code,password',
        '1001,EMP001,John Doe,john@example.com,9876543210,Bangalore,Koramangala,Jane Smith,Developer,01-01-2023,15-06-1990,O+,1234567890,ICIC0001234,changeme123',
        '1002,EMP002,Jane Smith,jane@example.com,9876543211,Delhi,GURGAON,Mark Johnson,Manager,15-03-2022,20-08-1985,A+,9876543210,HDFC0005678,changeme123'
      ].join('\n')
    };

    return templates[type] || '';
  }
}

module.exports = CSVProcessingService;
