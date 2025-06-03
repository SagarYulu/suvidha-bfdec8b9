
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const mysql = require('mysql2/promise');

const router = express.Router();

// MySQL connection configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'grievance_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Export issues data
router.post('/issues', authenticateToken, async (req, res) => {
    try {
        const { filters = {}, dateRange = {} } = req.body;
        const connection = await mysql.createConnection(mysqlConfig);
        
        let query = `
            SELECT 
                i.id,
                i.title,
                i.description,
                i.category,
                i.priority,
                i.status,
                i.employee_id,
                u.name as employee_name,
                u.email as employee_email,
                u.department as employee_department,
                i.assigned_to,
                au.name as assigned_to_name,
                i.created_at,
                i.updated_at,
                (SELECT COUNT(*) FROM issue_comments ic WHERE ic.issue_id = i.id) as comments_count
            FROM issues i
            LEFT JOIN users u ON i.employee_id = u.id
            LEFT JOIN dashboard_users au ON i.assigned_to = au.id
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        if (dateRange.from) {
            query += ' AND i.created_at >= ?';
            queryParams.push(dateRange.from);
        }
        
        if (dateRange.to) {
            query += ' AND i.created_at <= ?';
            queryParams.push(dateRange.to);
        }
        
        if (filters.status) {
            query += ' AND i.status = ?';
            queryParams.push(filters.status);
        }
        
        if (filters.priority) {
            query += ' AND i.priority = ?';
            queryParams.push(filters.priority);
        }
        
        if (filters.category) {
            query += ' AND i.category = ?';
            queryParams.push(filters.category);
        }
        
        if (filters.department) {
            query += ' AND u.department = ?';
            queryParams.push(filters.department);
        }
        
        query += ' ORDER BY i.created_at DESC';
        
        const [rows] = await connection.execute(query, queryParams);
        await connection.end();
        
        // Format data for CSV export
        const exportData = rows.map(row => ({
            'Issue ID': row.id,
            'Title': row.title,
            'Description': row.description,
            'Category': row.category,
            'Priority': row.priority,
            'Status': row.status,
            'Employee ID': row.employee_id,
            'Employee Name': row.employee_name || 'N/A',
            'Employee Email': row.employee_email || 'N/A',
            'Department': row.employee_department || 'N/A',
            'Assigned To': row.assigned_to_name || 'Unassigned',
            'Comments Count': row.comments_count,
            'Created At': new Date(row.created_at).toISOString().split('T')[0],
            'Updated At': new Date(row.updated_at).toISOString().split('T')[0]
        }));
        
        res.json({
            success: true,
            data: exportData,
            count: exportData.length,
            filename: `issues-export-${new Date().toISOString().split('T')[0]}.csv`
        });
        
    } catch (error) {
        console.error('Error exporting issues:', error);
        res.status(500).json({ error: 'Failed to export issues data' });
    }
});

// Export analytics summary
router.post('/analytics', authenticateToken, async (req, res) => {
    try {
        const { filters = {} } = req.body;
        const connection = await mysql.createConnection(mysqlConfig);
        
        // Get basic analytics
        const analyticsQuery = `
            SELECT 
                COUNT(*) as total_issues,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues,
                AVG(CASE WHEN status = 'closed' AND created_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, created_at, updated_at) END) as avg_resolution_time_hours
            FROM issues
            WHERE 1=1
        `;
        
        const [analyticsRows] = await connection.execute(analyticsQuery);
        const analytics = analyticsRows[0];
        
        // Get issues by category
        const categoryQuery = `
            SELECT category, COUNT(*) as count
            FROM issues
            GROUP BY category
            ORDER BY count DESC
        `;
        
        const [categoryRows] = await connection.execute(categoryQuery);
        
        // Get issues by department
        const departmentQuery = `
            SELECT 
                u.department,
                COUNT(*) as count
            FROM issues i
            LEFT JOIN users u ON i.employee_id = u.id
            WHERE u.department IS NOT NULL
            GROUP BY u.department
            ORDER BY count DESC
        `;
        
        const [departmentRows] = await connection.execute(departmentQuery);
        
        await connection.end();
        
        // Format data for export
        const exportData = [
            {
                'Metric': 'Total Issues',
                'Value': analytics.total_issues,
                'Category': 'Overview'
            },
            {
                'Metric': 'Open Issues',
                'Value': analytics.open_issues,
                'Category': 'Overview'
            },
            {
                'Metric': 'Resolved Issues',
                'Value': analytics.resolved_issues,
                'Category': 'Overview'
            },
            {
                'Metric': 'Closed Issues',
                'Value': analytics.closed_issues,
                'Category': 'Overview'
            },
            {
                'Metric': 'Average Resolution Time (Hours)',
                'Value': analytics.avg_resolution_time_hours ? Math.round(analytics.avg_resolution_time_hours) : 'N/A',
                'Category': 'Performance'
            },
            ...categoryRows.map(row => ({
                'Metric': `Issues in ${row.category}`,
                'Value': row.count,
                'Category': 'By Category'
            })),
            ...departmentRows.map(row => ({
                'Metric': `Issues from ${row.department}`,
                'Value': row.count,
                'Category': 'By Department'
            }))
        ];
        
        res.json({
            success: true,
            data: exportData,
            count: exportData.length,
            filename: `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
        });
        
    } catch (error) {
        console.error('Error exporting analytics:', error);
        res.status(500).json({ error: 'Failed to export analytics data' });
    }
});

// Export feedback data
router.post('/feedback', authenticateToken, async (req, res) => {
    try {
        const { filters = {} } = req.body;
        const connection = await mysql.createConnection(mysqlConfig);
        
        let query = `
            SELECT 
                f.id,
                f.issue_id,
                f.employee_id,
                u.name as employee_name,
                u.email as employee_email,
                u.department,
                f.rating,
                f.feedback_text,
                f.resolution_satisfaction,
                f.created_at
            FROM feedback f
            LEFT JOIN users u ON f.employee_id = u.id
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        if (filters.dateRange?.from) {
            query += ' AND f.created_at >= ?';
            queryParams.push(filters.dateRange.from);
        }
        
        if (filters.dateRange?.to) {
            query += ' AND f.created_at <= ?';
            queryParams.push(filters.dateRange.to);
        }
        
        if (filters.rating) {
            query += ' AND f.rating = ?';
            queryParams.push(filters.rating);
        }
        
        if (filters.satisfaction) {
            query += ' AND f.resolution_satisfaction = ?';
            queryParams.push(filters.satisfaction);
        }
        
        query += ' ORDER BY f.created_at DESC';
        
        const [rows] = await connection.execute(query, queryParams);
        await connection.end();
        
        // Format data for CSV export
        const exportData = rows.map(row => ({
            'Feedback ID': row.id,
            'Issue ID': row.issue_id,
            'Employee ID': row.employee_id,
            'Employee Name': row.employee_name || 'N/A',
            'Employee Email': row.employee_email || 'N/A',
            'Department': row.department || 'N/A',
            'Rating': row.rating,
            'Feedback Text': row.feedback_text || 'N/A',
            'Resolution Satisfaction': row.resolution_satisfaction,
            'Created At': new Date(row.created_at).toISOString().split('T')[0]
        }));
        
        res.json({
            success: true,
            data: exportData,
            count: exportData.length,
            filename: `feedback-export-${new Date().toISOString().split('T')[0]}.csv`
        });
        
    } catch (error) {
        console.error('Error exporting feedback:', error);
        res.status(500).json({ error: 'Failed to export feedback data' });
    }
});

// Export all data (comprehensive)
router.post('/comprehensive', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(mysqlConfig);
        
        // Export issues with all related data
        const issuesQuery = `
            SELECT 
                i.id as issue_id,
                i.title,
                i.description,
                i.category,
                i.priority,
                i.status,
                u.name as employee_name,
                u.email as employee_email,
                u.employee_id as emp_id,
                u.department,
                au.name as assigned_to_name,
                i.created_at as issue_created_at,
                i.updated_at as issue_updated_at,
                COUNT(DISTINCT ic.id) as public_comments_count,
                COUNT(DISTINCT iic.id) as internal_comments_count,
                AVG(f.rating) as avg_feedback_rating
            FROM issues i
            LEFT JOIN users u ON i.employee_id = u.id
            LEFT JOIN dashboard_users au ON i.assigned_to = au.id
            LEFT JOIN issue_comments ic ON i.id = ic.issue_id
            LEFT JOIN issue_internal_comments iic ON i.id = iic.issue_id
            LEFT JOIN feedback f ON i.id = f.issue_id
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `;
        
        const [issuesData] = await connection.execute(issuesQuery);
        await connection.end();
        
        const exportData = issuesData.map(row => ({
            'Issue ID': row.issue_id,
            'Title': row.title,
            'Description': row.description,
            'Category': row.category,
            'Priority': row.priority,
            'Status': row.status,
            'Employee Name': row.employee_name || 'N/A',
            'Employee Email': row.employee_email || 'N/A',
            'Employee ID': row.emp_id || 'N/A',
            'Department': row.department || 'N/A',
            'Assigned To': row.assigned_to_name || 'Unassigned',
            'Public Comments': row.public_comments_count || 0,
            'Internal Comments': row.internal_comments_count || 0,
            'Average Rating': row.avg_feedback_rating ? parseFloat(row.avg_feedback_rating).toFixed(1) : 'N/A',
            'Created Date': new Date(row.issue_created_at).toISOString().split('T')[0],
            'Last Updated': new Date(row.issue_updated_at).toISOString().split('T')[0]
        }));
        
        res.json({
            success: true,
            data: exportData,
            count: exportData.length,
            filename: `comprehensive-export-${new Date().toISOString().split('T')[0]}.csv`
        });
        
    } catch (error) {
        console.error('Error exporting comprehensive data:', error);
        res.status(500).json({ error: 'Failed to export comprehensive data' });
    }
});

module.exports = router;
