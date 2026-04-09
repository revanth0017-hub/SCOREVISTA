import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    players: { type: Number, default: 0, min: 0 },
    matchesPlayed: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    captain: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

teamSchema.index({ sport: 1, name: 1 }, { unique: true });

export default mongoose.model('Team', teamSchema);
