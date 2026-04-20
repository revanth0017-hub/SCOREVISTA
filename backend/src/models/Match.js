import mongoose from 'mongoose';

// Cricket event (ball-by-ball)
const cricketBallSchema = new mongoose.Schema(
  {
    ballId: Number, // Sequential ball number
    event: String, // 'runs-0','runs-1','runs-2','runs-3','runs-4','runs-6','wicket','wide','noBall','legBye','bye'
    runsScored: Number,
    isWicket: Boolean,
    isExtra: Boolean, // wide, noBall, legBye, bye don't count as legal balls
    timestamp: Date,
  },
  { _id: false }
);

// Cricket innings (per innings)
const cricketInningsSchema = new mongoose.Schema(
  {
    inningsNum: { type: Number, enum: [1, 2] },
    battingTeamId: mongoose.Schema.Types.ObjectId,
    bowlingTeamId: mongoose.Schema.Types.ObjectId,
    balls: [cricketBallSchema],
    runs: { type: Number, default: 0 }, // Always initialized
    wickets: { type: Number, default: 0 }, // Always initialized
    overs: { type: String, default: '0.0' }, // e.g., "5.3" = 5 overs 3 balls; Always initialized
    status: { type: String, enum: ['not-started', 'live', 'completed'], default: 'not-started' },
    target: Number, // For innings 2
    totalOvers: { type: Number, default: 20 }, // Total overs limit for this innings
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    venue: { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming', index: true },
    
    // Legacy fields (for backward compatibility)
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    oversA: { type: String, trim: true },
    oversB: { type: String, trim: true },
    
    /**
     * Sport-specific structured score. Examples:
     * 
     * Cricket (NEW EVENT-BASED):
     *   {
     *     sportSlug: 'cricket',
     *     tossWinnerId: ObjectId,
     *     tossDecision: 'bat'|'bowl',
     *     currentInningsNum: 1|2,
     *     innings: [
     *       {
     *         inningsNum: 1,
     *         battingTeamId: ObjectId,
     *         bowlingTeamId: ObjectId,
     *         balls: [{ballId, event, runsScored, isWicket, isExtra, timestamp},...],
     *         runs: 145,
     *         wickets: 3,
     *         overs: "20.0",
     *         status: "completed"
     *       },
     *       { inningsNum: 2, ... }
     *     ]
     *   }
     * 
     * Football:
     *   { sportSlug: 'football', teamA: { goals }, teamB: { goals }, events: [...] }
     * 
     * Tennis:
     *   { sportSlug: 'tennis', teamA: { sets: [6,4,7] }, teamB: { sets: [4,6,6] }, currentGame: { pointsA, pointsB } }
     * 
     * Basketball:
     *   { sportSlug: 'basketball', teamA: { points, quarter }, teamB: { points, quarter } }
     * 
     * Volleyball:
     *   { sportSlug: 'volleyball', teamA: { sets: [25,22,15] }, teamB: { sets: [20,18,20] } }
     * 
     * Kabaddi:
     *   { sportSlug: 'kabaddi', teamA: { raids, tackles, total }, teamB: {...} }
     * 
     * Badminton/Shuttle:
     *   { sportSlug: 'shuttle', teamA: { points, sets }, teamB: {...} }
     */
    sportScore: { type: mongoose.Schema.Types.Mixed },
    
    extraInfo: { type: String, trim: true },
  },
  { timestamps: true }
);

matchSchema.index({ sport: 1, status: 1, date: -1 });
matchSchema.index({ teamA: 1, teamB: 1, date: -1 });

export default mongoose.model('Match', matchSchema);
