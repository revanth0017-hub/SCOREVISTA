import mongoose from 'mongoose';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import Sport from '../models/Sport.js';

/**
 * Get all players for a team
 * GET /api/players?teamId=...
 */
export async function list(req, res, next) {
  try {
    const { teamId, sportId } = req.query;
    
    const query = {};
    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ success: false, message: 'Invalid teamId' });
      }
      query.team = teamId;
    }
    if (sportId) {
      if (!mongoose.Types.ObjectId.isValid(sportId)) {
        return res.status(400).json({ success: false, message: 'Invalid sportId' });
      }
      query.sport = sportId;
    }

    const players = await Player.find(query)
      .populate('team', 'name sport')
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, data: players, message: 'Players fetched' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single player
 * GET /api/players/:id
 */
export async function getOne(req, res, next) {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team', 'name sport')
      .lean();
    
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.json({ success: true, data: player });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new player
 * POST /api/players
 */
export async function create(req, res, next) {
  try {
    const { name, team, sport, number, role } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name required' });
    }
    if (!team) {
      return res.status(400).json({ success: false, message: 'Team ID required' });
    }
    if (!sport) {
      return res.status(400).json({ success: false, message: 'Sport required' });
    }

    if (!mongoose.Types.ObjectId.isValid(team)) {
      return res.status(400).json({ success: false, message: 'Invalid team ID' });
    }

    // Verify team exists
    const teamDoc = await Team.findById(team).lean();
    if (!teamDoc) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify sport exists
    const sportDoc = await Sport.findOne({ slug: sport }).lean();
    if (!sportDoc) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }

    // Initialize stats based on sport
    const stats = {
      runs: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      tackles: 0,
      fouls: 0,
      ownGoals: 0,
      points: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      aces: 0,
      kills: 0,
      errors: 0,
      sets: 0,
      digs: 0,
      doubleFaults: 0,
      winners: 0,
      unforcedErrors: 0,
      setsWon: 0,
      gamesWon: 0,
      raidPoints: 0,
      bonus: 0,
      allOuts: 0,
      serviceErrors: 0,
      rallies: 0,
    };

    const player = await Player.create({
      name: name.trim(),
      team,
      sport,
      number,
      role,
      stats,
    });

    const populated = await Player.findById(player._id)
      .populate('team', 'name sport')
      .lean();

    res.status(201).json({ success: true, data: populated, message: 'Player created' });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a player
 * PATCH /api/players/:id
 */
export async function update(req, res, next) {
  try {
    const { name, number, role, stats } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (number !== undefined) updates.number = number;
    if (role !== undefined) updates.role = role;
    
    // Allow stat updates
    if (stats && typeof stats === 'object') {
      for (const [key, value] of Object.entries(stats)) {
        if (typeof value === 'number') {
          updates[`stats.${key}`] = value;
        }
      }
    }

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('team', 'name sport')
      .lean();

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.json({ success: true, data: player, message: 'Player updated' });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a player
 * DELETE /api/players/:id
 */
export async function remove(req, res, next) {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.json({ success: true, message: 'Player deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get player stats/leaderboard for a sport
 * GET /api/players/leaderboard/:sport
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { sport } = req.params;
    const { stat = 'points', limit = 10 } = req.query;

    if (!sport) {
      return res.status(400).json({ success: false, message: 'Sport slug required' });
    }

    const query = { sport };
    const sortObj = {};
    sortObj[`stats.${stat}`] = -1;

    const players = await Player.find(query)
      .populate('team', 'name')
      .sort(sortObj)
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ success: true, data: players, message: 'Leaderboard fetched' });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset player stats
 * POST /api/players/:id/reset-stats
 */
export async function resetStats(req, res, next) {
  try {
    const stats = {
      runs: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      tackles: 0,
      fouls: 0,
      ownGoals: 0,
      points: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      aces: 0,
      kills: 0,
      errors: 0,
      sets: 0,
      digs: 0,
      doubleFaults: 0,
      winners: 0,
      unforcedErrors: 0,
      setsWon: 0,
      gamesWon: 0,
      raidPoints: 0,
      bonus: 0,
      allOuts: 0,
      serviceErrors: 0,
      rallies: 0,
    };

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $set: { stats } },
      { new: true }
    ).populate('team', 'name sport')
      .lean();

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.json({ success: true, data: player, message: 'Player stats reset' });
  } catch (err) {
    next(err);
  }
}

/**
 * Bulk update player stats
 * POST /api/players/bulk-update-stats
 */
export async function bulkUpdateStats(req, res, next) {
  try {
    const { updates } = req.body; // Array of {playerId, statUpdates}
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Updates array required' });
    }

    const results = [];
    for (const { playerId, statUpdates } of updates) {
      if (!playerId || typeof statUpdates !== 'object') continue;

      const updateObj = {};
      for (const [key, value] of Object.entries(statUpdates)) {
        updateObj[`stats.${key}`] = value;
      }

      const player = await Player.findByIdAndUpdate(
        playerId,
        { $inc: updateObj },
        { new: true }
      ).lean();

      if (player) results.push(player);
    }

    res.json({ success: true, data: results, message: `Updated ${results.length} player(s)` });
  } catch (err) {
    next(err);
  }
}
