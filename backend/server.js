import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import issueRoutes from './routes/issueRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import inferRoutes from './routes/inferRoutes.js';
import { getNearbyPotholes } from './services/proximityService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io with CORS
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Make io accessible in controllers
export { io };

app.use(cors());
app.use(express.json());

// Routes
app.use('/issues', issueRoutes);
app.use('/cron', cronRoutes);
app.use('/infer', inferRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Pothole Real-Time Backend running.' });
});

// ─── Socket.io Real-Time Layer ─────────────────────────────────────────────
const ALERT_RADIUS = parseInt(process.env.ALERT_RADIUS_METERS || '200');

io.on('connection', (socket) => {
  console.log(`[socket] Traveler connected: ${socket.id}`);

  // Traveler streams their live GPS every few seconds
  socket.on('traveler:location', async ({ lat, lng }) => {
    try {
      const nearby = await getNearbyPotholes(lat, lng, ALERT_RADIUS);

      if (nearby.length > 0) {
        // Emit alert only to THIS traveler's socket
        socket.emit('pothole:alert', {
          count: nearby.length,
          potholes: nearby,
          message: `⚠️ ${nearby.length} pothole(s) detected within ${ALERT_RADIUS}m of your location. Check alternative route.`
        });
      }
    } catch (err) {
      console.error('[socket] proximity check error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[socket] Traveler disconnected: ${socket.id}`);
  });
});

// ─── DB + Server Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/pothole_tracker';

mongoose.connect(DB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB.');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
