
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const db = require('../config/database');

class ExportService {
  async exportIssues(format = 'csv', filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND i.status = ?';
        params.push(filters.status);
      }

      if (filters.priority) {
        whereClause += ' AND i.priority = ?';
        params.push(filters.priority);
      }

      const [issues] = await db.execute(
        `SELECT i.*, e.name as creator_name, du.name as assigned_name 
         FROM issues i 
         LEFT JOIN employees e ON i.created_by = e.id 
         LEFT JOIN dashboard_users du ON i.assigned_to = du.id 
         ${whereClause} 
         ORDER BY i.created_at DESC`,
        params
      );

      if (format === 'excel') {
        return this.createExcelFile(issues, 'issues');
      } else {
        return this.createCSVFile(issues, 'issues');
      }
    } catch (error) {
      console.error('Error exporting issues:', error);
      throw error;
    }
  }

  async exportUsers(format = 'csv', filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.role) {
        whereClause += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      const [users] = await db.execute(
        `SELECT id, name, email, role, status, created_at, updated_at 
         FROM dashboard_users 
         ${whereClause} 
         ORDER BY created_at DESC`,
        params
      );

      if (format === 'excel') {
        return this.createExcelFile(users, 'users');
      } else {
        return this.createCSVFile(users, 'users');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  createCSVFile(data, type) {
    const fields = type === 'issues' 
      ? ['id', 'title', 'description', 'category', 'priority', 'status', 'creator_name', 'assigned_name', 'created_at']
      : ['id', 'name', 'email', 'role', 'status', 'created_at'];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    return {
      data: csv,
      filename: `${type}-export-${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  async createExcelFile(data, type) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type);

    if (type === 'issues') {
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Priority', key: 'priority', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Creator', key: 'creator_name', width: 20 },
        { header: 'Assigned To', key: 'assigned_name', width: 20 },
        { header: 'Created At', key: 'created_at', width: 20 }
      ];
    } else {
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created At', key: 'created_at', width: 20 }
      ];
    }

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      data: buffer,
      filename: `${type}-export-${new Date().toISOString().split('T')[0]}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}

module.exports = new ExportService();
