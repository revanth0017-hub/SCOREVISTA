import mongoose from 'mongoose';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import Sport from '../models/Sport.js';

/**
 * List all players for a sport, optionally filtered by team
 * GET /api/players?sportId=xxx&teamId=yyy
 */
export async function list(req, res, next) {
  try {
    const { sportId, teamId } = req.query;
    if (!sportId) {
      return res.status(400).json({ success: false, message: 'sportId query param is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }

    const query = { sport: sportId };
    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ success: false, message: 'Invalid teamId' });
      }
      query.team = teamId;
    }

    const players = await Player.find(query)
      .populate('team', 'name')
      .populate('sport', 'name slug')
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
      .populate('sport', 'name slug')
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
 * Create a player
 * POST /api/players
 * Body: { name, teamId, sportId, number, role }
 */
export async function create(req, res, next) {
  try {
    const { name, teamId, sportId, number, role } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required' });
    }
    if (!sportId) {
      return res.status(400).json({ success: false, message: 'sportId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ success: false, message: 'Invalid teamId' });
    }
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }

    // Verify team belongs to this sport
    const team = await Team.findById(teamId).lean();
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    if (String(team.sport) !== String(sportId)) {
      return res.status(400).json({ success: false, message: 'Team does not belong to this sport' });
    }

    // Verify sport exists
    const sport = await Sport.findById(sportId).lean();
    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }

    const player = await Player.create({
      name: name.trim(),
      team: teamId,
      sport: sportId,
      number: number ? Number(number) : undefined,
      role: role?.trim(),
      stats: {},
    });

    // Update team's playerList
    await Team.findByIdAndUpdate(
      teamId,
      { $push: { playerList: { name: player.name, number: player.number, role: player.role } } },
      { new: true }
    );

    const populated = await Player.findById(player._id)
      .populate('team', 'name')
      .populate('sport', 'name slug')
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
    const { name, number, role } = req.body;
    
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    if (name?.trim()) player.name = name.trim();
    if (number !== undefined) player.number = Number(number);
    if (role?.trim()) player.role = role.trim();

    await player.save();

    const updated = await Player.findById(player._id)
      .populate('team', 'name')
      .populate('sport', 'name slug')
      .lean();

    res.json({ success: true, data: updated, message: 'Player updated' });
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
 * Get player stats (can be filtered by match, season, etc.)
 * GET /api/players/:id/stats?matchId=xxx
 */
export async function getStats(req, res, next) {
  try {
    const player = await Player.findById(req.params.id).lean();
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    res.json({ success: true, data: { ...player, stats: player.stats || {} }, message: 'Player stats fetched' });
  } catch (err) {
    next(err);
  }
}

/**
 * Update player stats (used internally by match events)
 * POST /api/players/:id/stats/update
 * Body: { runs, wickets, goals, assists, points, aces, fouls, etc. }
 */
export async function updateStats(req, res, next) {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const statFields = ['runs', 'wickets', 'goals', 'assists', 'points', 'aces', 'fouls', 'sets', 'games'];
    for (const field of statFields) {
      if (req.body[field] !== undefined) {
        if (field === 'sets' || field === 'games') {
          if (Array.isArray(req.body[field])) {
            player.stats[field] = req.body[field];
          }
        } else {
          player.stats[field] = (player.stats[field] || 0) + Number(req.body[field]);
        }
      }
    }

    await player.save();

    const updated = await Player.findById(player._id)
      .populate('team', 'name')
      .populate('sport', 'name slug')
      .lean();

    res.json({ success: true, data: updated, message: 'Player stats updated' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get top players by stat (e.g., most runs, most goals)
 * GET /api/players/leaderboard?sportId=xxx&stat=runs&limit=10
 */
export async function leaderboard(req, res, next) {
  try {
    const { sportId, stat = 'runs', limit = 10 } = req.query;
    
    if (!sportId) {
      return res.status(400).json({ success: false, message: 'sportId query param is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }

    const validStats = ['runs', 'wickets', 'goals', 'assists', 'points', 'aces', 'fouls'];
    if (!validStats.includes(stat)) {
      return res.status(400).json({ success: false, message: `Invalid stat. Must be one of: ${validStats.join(', ')}` });
    }

    const players = await Player.find({ sport: sportId })
      .populate('team', 'name')
      .populate('sport', 'name slug')
      .sort({ [`stats.${stat}`]: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ success: true, data: players, stat, message: 'Leaderboard fetched' });
  } catch (err) {
    next(err);
  }
}
