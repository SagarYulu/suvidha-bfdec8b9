
const exportService = require('../services/exportService');

class ExportController {
  async exportIssues(req, res) {
    try {
      const { format = 'csv' } = req.query;
      const filters = req.query;
      
      const result = await exportService.exportIssues(format, filters);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
      
      if (format === 'excel') {
        res.send(result.data);
      } else {
        res.send(result.data);
      }
    } catch (error) {
      console.error('Export issues error:', error);
      res.status(500).json({ error: 'Failed to export issues' });
    }
  }

  async exportUsers(req, res) {
    try {
      const { format = 'csv' } = req.query;
      const filters = req.query;
      
      const result = await exportService.exportUsers(format, filters);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
      
      if (format === 'excel') {
        res.send(result.data);
      } else {
        res.send(result.data);
      }
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({ error: 'Failed to export users' });
    }
  }
}

module.exports = new ExportController();
