
const express = require('express');
const router = express.Router();
const tatService = require('../../services/actualTatService');
const { authenticateToken } = require('../../middleware/auth');

// TAT Analytics endpoint
router.get('/tat-metrics', authenticateToken, async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      city: req.query.city,
      cluster: req.query.cluster
    };

    const tatData = await tatService.getTATMetrics(filters);
    res.json(tatData);
  } catch (error) {
    console.error('Error fetching TAT metrics:', error);
    res.status(500).json({ error: 'Failed to fetch TAT metrics' });
  }
});

// SLA Breach Analytics
router.get('/sla-breaches', authenticateToken, async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      city: req.query.city,
      cluster: req.query.cluster
    };

    const slaData = await tatService.getSLABreaches(filters);
    res.json(slaData);
  } catch (error) {
    console.error('Error fetching SLA breaches:', error);
    res.status(500).json({ error: 'Failed to fetch SLA breaches' });
  }
});

// Average Resolution Time
router.get('/avg-resolution-time', authenticateToken, async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      city: req.query.city,
      cluster: req.query.cluster
    };

    const avgTime = await tatService.getAvgResolutionTime(filters);
    res.json(avgTime);
  } catch (error) {
    console.error('Error fetching average resolution time:', error);
    res.status(500).json({ error: 'Failed to fetch average resolution time' });
  }
});

// Trend Data
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const filters = {
      city: req.query.city,
      cluster: req.query.cluster
    };

    const trendData = await tatService.getTrendData(period, filters);
    res.json(trendData);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

module.exports = router;
