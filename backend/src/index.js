import './config/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import sportsRoutes from './routes/sports.js';
import teamsRoutes from './routes/teams.js';
import matchesRoutes from './routes/matches.js';
import highlightsRoutes from './routes/highlights.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

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
app.use('/api/matches', matchesRoutes);
app.use('/api/highlights', highlightsRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`ScoreVista backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
