
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const WebSocketService = require('./services/websocketService');

// Import consolidated routes
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Global WebSocket service instance
let wsService;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize WebSocket service
    wsService = new WebSocketService(server);
    
    // Make WebSocket service available globally
    app.set('wsService', wsService);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket URL: ws://localhost:${PORT}?token=<JWT_TOKEN>`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 File uploads: ${uploadsDir}`);
      console.log(`✨ Features enabled: WebSocket, File Upload, Bulk Upload, Analytics`);
      console.log(`📅 Database: ${process.env.DB_NAME || 'yulu_suvidha'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, wsService };
