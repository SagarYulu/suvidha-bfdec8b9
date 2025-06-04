
const db = require('../config/database');
const json2csv = require('json2csv').Parser;
const ExcelJS = require('exceljs');

class ExportService {
  async exportIssues(format = 'csv', filters = {}) {
    const { startDate, endDate, status, priority } = filters;
    
    let query = `
      SELECT 
        i.id,
        i.employee_uuid,
        e.name as employee_name,
        e.email as employee_email,
        e.manager,
        e.city,
        e.cluster,
        i.type_id,
        i.sub_type_id,
        i.description,
        i.status,
        i.priority,
        i.created_at,
        i.updated_at,
        i.closed_at,
        i.assigned_to,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND i.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND i.created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const [issues] = await db.execute(query, params);

    if (format === 'excel') {
      return this.generateExcelFile(issues, 'issues');
    } else {
      return this.generateCSVFile(issues, 'issues');
    }
  }

  async exportUsers(format = 'csv', filters = {}) {
    const { role, department } = filters;
    
    let query = `
      SELECT 
        id, name, email, phone, employee_id, department, manager, 
        city, cluster, role, created_at, updated_at
      FROM users 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await db.execute(query, params);

    if (format === 'excel') {
      return this.generateExcelFile(users, 'users');
    } else {
      return this.generateCSVFile(users, 'users');
    }
  }

  generateCSVFile(data, type) {
    const fields = Object.keys(data[0] || {});
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(data);
    
    return {
      data: csv,
      filename: `${type}-export-${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  async generateExcelFile(data, type) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${type} Export`);
    
    if (data.length > 0) {
      const columns = Object.keys(data[0]).map(key => ({
        header: key.replace(/_/g, ' ').toUpperCase(),
        key: key,
        width: 20
      }));
      
      worksheet.columns = columns;
      
      data.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      data: buffer,
      filename: `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}

module.exports = new ExportService();
