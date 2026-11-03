const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // fallback to cwd
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const store = require('./data/store');
const { initDatabase, isMySQLConnected } = require('./config/db');

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup WebSocket server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app so routes can broadcast events
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Emit current device and reminder states on connect
  socket.emit('INIT_STATE', {
    devices: store.devices,
    reminders: store.reminders,
    routines: store.routines,
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Routine Backend',
    mysqlConnected: isMySQLConnected(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 15),
    connectedClients: io.engine.clientsCount
  });
});

// API Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`⚡ Smart Routine Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for ESP8266 and Web Dashboard`);
  
  // Initialize MySQL Connection (safe auto-fallback if credentials not set)
  await initDatabase();

  console.log(`🤖 Routine AI Assistant: ${process.env.GEMINI_API_KEY ? 'Cloud Key Configured' : 'Smart Engine Mode'}`);
  console.log(`=======================================================`);
});
