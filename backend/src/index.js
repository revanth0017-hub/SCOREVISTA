import './config/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import sportsRoutes from './routes/sports.js';
import teamsRoutes from './routes/teams.js';
import playersRoutes from './routes/players.js';
import matchesRoutes from './routes/matches.js';
import highlightsRoutes from './routes/highlights.js';
import seedSportLimits from './seeds/sportLimits.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 61234;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const origins = corsOrigin.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin) || origins.includes('*')) return cb(null, true);
      cb(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ScoreVista API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/highlights', highlightsRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  // Seed sport player limits
  await seedSportLimits();
  
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      // Be permissive in dev so socket works on 3000/3001, etc.
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client can optionally join a sport room: { sportId }
    socket.on('joinSport', ({ sportId } = {}) => {
      if (sportId) socket.join(`sport:${sportId}`);
    });
  });

  app.set('io', io);

  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or change backend/.env PORT.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`ScoreVista backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
