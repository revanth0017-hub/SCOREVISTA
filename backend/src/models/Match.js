import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    venue: { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming', index: true },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    oversA: { type: String, trim: true },
    oversB: { type: String, trim: true },
    /** Sport-specific structured score (cricket runs/wkts/overs, tennis sets[], etc.) */
    sportScore: { type: mongoose.Schema.Types.Mixed },
    extraInfo: { type: String, trim: true },
  },
  { timestamps: true }
);

matchSchema.index({ sport: 1, status: 1, date: -1 });
matchSchema.index({ teamA: 1, teamB: 1, date: -1 });

export default mongoose.model('Match', matchSchema);
