
const express = require('express');
const realTimeService = require('../services/realTimeService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// SSE endpoint for real-time updates
router.get('/stream', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  console.log(`Real-time connection established for user: ${userId}`);
  
  // Add client to real-time service
  realTimeService.addClient(userId, res);
  
  // Log connection stats
  console.log(`Active connections: ${realTimeService.getConnectionCount()}`);
  console.log(`Connected users: ${realTimeService.getConnectedUsers().length}`);
});

// Get connection statistics (admin only)
router.get('/stats', authenticateToken, (req, res) => {
  // Check if user has admin privileges
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  res.json({
    totalConnections: realTimeService.getConnectionCount(),
    connectedUsers: realTimeService.getConnectedUsers().length,
    connectedUserIds: realTimeService.getConnectedUsers()
  });
});

// Manual broadcast endpoint (admin only)
router.post('/broadcast', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { event, data } = req.body;
  
  if (!event || !data) {
    return res.status(400).json({ error: 'Event and data are required' });
  }

  realTimeService.broadcast(event, data);
  
  res.json({
    success: true,
    message: 'Broadcast sent',
    recipients: realTimeService.getConnectionCount()
  });
});

module.exports = router;
