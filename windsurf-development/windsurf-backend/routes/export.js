
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const json2csv = require('json2csv').Parser;
const ExcelJS = require('exceljs');

const router = express.Router();

// Export issues data
router.get('/issues', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, status, priority } = req.query;
    
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
        du.name as assigned_to_name,
        i.mapped_type_id,
        i.mapped_sub_type_id,
        i.mapped_at,
        i.mapped_by,
        COUNT(ic.id) as comments_count,
        COUNT(iic.id) as internal_comments_count
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      LEFT JOIN issue_comments ic ON i.id = ic.issue_id
      LEFT JOIN issue_internal_comments iic ON i.id = iic.issue_id
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
    
    query += ' GROUP BY i.id ORDER BY i.created_at DESC';
    
    const [issues] = await db.execute(query, params);
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Issues Export');
      
      // Define columns
      worksheet.columns = [
        { header: 'Issue ID', key: 'id', width: 30 },
        { header: 'Employee Name', key: 'employee_name', width: 20 },
        { header: 'Employee Email', key: 'employee_email', width: 25 },
        { header: 'Manager', key: 'manager', width: 20 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'Cluster', key: 'cluster', width: 15 },
        { header: 'Type ID', key: 'type_id', width: 15 },
        { header: 'Sub Type ID', key: 'sub_type_id', width: 15 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Updated At', key: 'updated_at', width: 20 },
        { header: 'Closed At', key: 'closed_at', width: 20 },
        { header: 'Assigned To', key: 'assigned_to_name', width: 20 },
        { header: 'Comments Count', key: 'comments_count', width: 15 },
        { header: 'Internal Comments Count', key: 'internal_comments_count', width: 20 }
      ];
      
      // Add data
      issues.forEach(issue => {
        worksheet.addRow({
          ...issue,
          created_at: new Date(issue.created_at).toLocaleString(),
          updated_at: new Date(issue.updated_at).toLocaleString(),
          closed_at: issue.closed_at ? new Date(issue.closed_at).toLocaleString() : ''
        });
      });
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=issues-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV export
      const fields = [
        'id', 'employee_name', 'employee_email', 'manager', 'city', 'cluster',
        'type_id', 'sub_type_id', 'description', 'status', 'priority',
        'created_at', 'updated_at', 'closed_at', 'assigned_to_name',
        'comments_count', 'internal_comments_count'
      ];
      
      const json2csvParser = new json2csv({ fields });
      const csv = json2csvParser.parse(issues);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=issues-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    }
    
  } catch (error) {
    console.error('Export issues error:', error);
    res.status(500).json({ error: 'Failed to export issues' });
  }
});

// Export analytics data
router.get('/analytics', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get analytics summary
    const [analytics] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        AVG(CASE WHEN closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, created_at, closed_at) END) as avg_resolution_time_hours
      FROM issues
    `);
    
    // Get breakdown by city
    const [cityBreakdown] = await db.execute(`
      SELECT 
        e.city,
        COUNT(*) as issue_count,
        COUNT(CASE WHEN i.status = 'closed' THEN 1 END) as closed_count
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      WHERE e.city IS NOT NULL
      GROUP BY e.city
      ORDER BY issue_count DESC
    `);
    
    // Get breakdown by type
    const [typeBreakdown] = await db.execute(`
      SELECT 
        type_id,
        COUNT(*) as issue_count,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
      FROM issues
      GROUP BY type_id
      ORDER BY issue_count DESC
    `);
    
    const exportData = {
      summary: analytics[0],
      cityBreakdown,
      typeBreakdown,
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      
      // Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRow(['Metric', 'Value']);
      summarySheet.addRow(['Total Issues', analytics[0].total_issues]);
      summarySheet.addRow(['Open Issues', analytics[0].open_issues]);
      summarySheet.addRow(['Closed Issues', analytics[0].closed_issues]);
      summarySheet.addRow(['In Progress Issues', analytics[0].in_progress_issues]);
      summarySheet.addRow(['Resolved Issues', analytics[0].resolved_issues]);
      summarySheet.addRow(['Average Resolution Time (Hours)', analytics[0].avg_resolution_time_hours]);
      
      // City breakdown sheet
      const citySheet = workbook.addWorksheet('City Breakdown');
      citySheet.addRow(['City', 'Total Issues', 'Closed Issues']);
      cityBreakdown.forEach(row => {
        citySheet.addRow([row.city, row.issue_count, row.closed_count]);
      });
      
      // Type breakdown sheet
      const typeSheet = workbook.addWorksheet('Type Breakdown');
      typeSheet.addRow(['Type ID', 'Total Issues', 'Closed Issues']);
      typeBreakdown.forEach(row => {
        typeSheet.addRow([row.type_id, row.issue_count, row.closed_count]);
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.json`);
      res.json(exportData);
    }
    
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

module.exports = router;
