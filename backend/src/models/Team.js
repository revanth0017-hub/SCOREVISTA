import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true }, // e.g. 'Batsman', 'Bowler', 'Goalkeeper', 'Forward', etc.
    number: { type: Number, min: 0 }, // Jersey number (optional)
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    // Legacy field (kept for backwards compatibility)
    players: { type: Number, default: 0, min: 0 },
    // New: detailed player list with roles/numbers
    playerList: [playerSchema],
    matchesPlayed: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    captain: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

teamSchema.index({ sport: 1, name: 1 }, { unique: true });

// Middleware to sync players count from playerList
teamSchema.pre('save', function(next) {
  if (Array.isArray(this.playerList)) {
    this.players = this.playerList.length;
  }
  next();
});

export default mongoose.model('Team', teamSchema);
