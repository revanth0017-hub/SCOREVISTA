import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema(
  {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    aces: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    sets: { type: [Number], default: [] },
    games: { type: [Number], default: [] },
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    stats: { type: playerStatsSchema, default: () => ({}) },
    number: { type: Number },
    role: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Player', playerSchema);
