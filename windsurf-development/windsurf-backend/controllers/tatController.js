
const tatService = require('../services/tatService');
const { validationResult } = require('express-validator');

class TATController {
  async getTATMetrics(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        city: req.query.city,
        cluster: req.query.cluster,
        priority: req.query.priority
      };

      const metrics = await tatService.getTATMetrics(filters);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting TAT metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getTATTrendData(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const trendData = await tatService.getTATTrendData(days);
      
      res.json({
        success: true,
        data: trendData
      });
    } catch (error) {
      console.error('Error getting TAT trend data:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSLABreaches(req, res) {
    try {
      const filters = {
        priority: req.query.priority,
        assignedTo: req.query.assignedTo
      };

      const breaches = await tatService.getSLABreaches(filters);
      
      res.json({
        success: true,
        data: breaches
      });
    } catch (error) {
      console.error('Error getting SLA breaches:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getTeamPerformance(req, res) {
    try {
      const performance = await tatService.getTeamPerformance();
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Error getting team performance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TATController();
