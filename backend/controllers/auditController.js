
const AuditService = require('../services/auditService');
const { HTTP_STATUS } = require('../config/constants');

class AuditController {
  async getAuditLogs(req, res) {
    try {
      const filters = req.query;
      const auditLogs = await AuditService.getAuditLogs(filters);

      res.status(HTTP_STATUS.OK).json({
        message: 'Audit logs retrieved successfully',
        data: auditLogs
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve audit logs',
        message: error.message
      });
    }
  }

  async getAuditStats(req, res) {
    try {
      const filters = req.query;
      const stats = await AuditService.getAuditStats(filters);

      res.status(HTTP_STATUS.OK).json({
        message: 'Audit statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve audit statistics',
        message: error.message
      });
    }
  }

  async getEntityAuditLogs(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const filters = {
        ...req.query,
        entity_type: entityType,
        entity_id: entityId
      };

      const auditLogs = await AuditService.getAuditLogs(filters);

      res.status(HTTP_STATUS.OK).json({
        message: 'Entity audit logs retrieved successfully',
        data: auditLogs
      });
    } catch (error) {
      console.error('Get entity audit logs error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve entity audit logs',
        message: error.message
      });
    }
  }

  async cleanupOldAuditLogs(req, res) {
    try {
      const { daysToKeep = 365 } = req.query;
      const deletedCount = await AuditService.cleanupOldAuditLogs(parseInt(daysToKeep));

      res.status(HTTP_STATUS.OK).json({
        message: 'Old audit logs cleaned up successfully',
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Cleanup audit logs error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to cleanup old audit logs',
        message: error.message
      });
    }
  }
}

module.exports = new AuditController();
