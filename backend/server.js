require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const setupSocket = require('./src/socket/socket.handler');

// Initialize Firebase (just importing triggers init)
require('./src/db/firebase');

const PORT = process.env.PORT || 5000;

// ==================== HTTP + Socket.io Server ====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to Express app so controllers can emit events
app.set('io', io);

// Set up Socket.io event handlers
setupSocket(io);

// ==================== Start Server ====================
server.listen(PORT, () => {
  console.log('\n🚀 TryScan Backend Server running!');
  console.log(`   API:      http://localhost:${PORT}/api`);
  console.log(`   Health:   http://localhost:${PORT}/api/health`);
  console.log(`   Socket:   ws://localhost:${PORT}`);
  console.log(`   Database: Firebase Firestore (tabletap-dine)`);
  console.log(`   Mode:     ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => process.exit(0));
});
