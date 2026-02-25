import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true, trim: true, lowercase: true },
    players: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    captain: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

teamSchema.index({ sport: 1 });

export default mongoose.model('Team', teamSchema);
