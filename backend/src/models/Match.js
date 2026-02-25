import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    team1: { type: String, required: true, trim: true },
    team2: { type: String, required: true, trim: true },
    sport: { type: String, required: true, trim: true, lowercase: true },
    venue: { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    overs1: { type: String, trim: true },
    overs2: { type: String, trim: true },
    extraInfo: { type: String, trim: true },
  },
  { timestamps: true }
);

matchSchema.index({ sport: 1 });
matchSchema.index({ status: 1 });

export default mongoose.model('Match', matchSchema);
