
const { getPool } = require('../config/database');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

class ExportService {
  static async exportIssues(filters = {}, format = 'csv') {
    const pool = getPool();
    const { startDate, endDate, status, priority, city, cluster, assignedTo } = filters;

    let query = `
      SELECT 
        i.id,
        i.description,
        i.issue_type,
        i.issue_subtype,
        i.status,
        i.priority,
        i.city,
        i.cluster,
        i.created_at,
        i.updated_at,
        i.resolved_at,
        e1.emp_name as reported_by_name,
        e2.emp_name as assigned_to_name,
        TIMESTAMPDIFF(HOUR, i.created_at, 
          CASE WHEN i.status = 'closed' THEN i.resolved_at ELSE NOW() END) as resolution_hours
      FROM issues i
      LEFT JOIN employees e1 ON i.reported_by = e1.id
      LEFT JOIN employees e2 ON i.assigned_to = e2.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND i.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND i.created_at <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }

    if (city) {
      query += ' AND i.city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND i.cluster = ?';
      params.push(cluster);
    }

    if (assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(assignedTo);
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.execute(query, params);

    if (format === 'csv') {
      return this.generateCSV(rows);
    } else if (format === 'excel') {
      return this.generateExcel(rows, 'Issues');
    }

    return rows;
  }

  static async exportFeedback(filters = {}, format = 'csv') {
    const pool = getPool();
    const { startDate, endDate, sentiment, city, cluster } = filters;

    let query = `
      SELECT 
        f.id,
        f.issue_id,
        f.feedback_option,
        f.sentiment,
        f.agent_name,
        f.city,
        f.cluster,
        f.created_at,
        i.description as issue_description,
        e.emp_name as employee_name
      FROM ticket_feedback f
      LEFT JOIN issues i ON f.issue_id = i.id
      LEFT JOIN employees e ON f.employee_uuid = e.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND f.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND f.created_at <= ?';
      params.push(endDate);
    }

    if (sentiment) {
      query += ' AND f.sentiment = ?';
      params.push(sentiment);
    }

    if (city) {
      query += ' AND f.city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND f.cluster = ?';
      params.push(cluster);
    }

    query += ' ORDER BY f.created_at DESC';

    const [rows] = await pool.execute(query, params);

    if (format === 'csv') {
      return this.generateCSV(rows);
    } else if (format === 'excel') {
      return this.generateExcel(rows, 'Feedback');
    }

    return rows;
  }

  static async exportAnalytics(type, filters = {}, format = 'csv') {
    let data = [];

    switch (type) {
      case 'sla_metrics':
        const AnalyticsService = require('./analyticsService');
        data = await AnalyticsService.getSLAMetrics(filters);
        break;
      case 'performance_metrics':
        const AnalyticsService2 = require('./analyticsService');
        data = await AnalyticsService2.getPerformanceMetrics(filters);
        break;
      default:
        throw new Error('Invalid analytics type');
    }

    if (format === 'csv') {
      return this.generateCSV(data);
    } else if (format === 'excel') {
      return this.generateExcel(data, `Analytics_${type}`);
    }

    return data;
  }

  static generateCSV(data) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const fields = Object.keys(data[0]);
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    return {
      content: csv,
      contentType: 'text/csv',
      filename: `export_${Date.now()}.csv`
    };
  }

  static async generateExcel(data, sheetName = 'Data') {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => row[header]);
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      content: buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `export_${Date.now()}.xlsx`
    };
  }
}

module.exports = ExportService;
