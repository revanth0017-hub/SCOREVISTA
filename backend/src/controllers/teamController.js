import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Sport from '../models/Sport.js';

export async function list(req, res, next) {
  try {
    const { sportId } = req.query;
    if (!sportId) {
      return res.status(400).json({ success: false, message: 'sportId query param is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }
    const list = await Team.find({ sport: sportId }).sort({ name: 1 }).lean();
    res.json({ success: true, data: list, message: 'Teams fetched' });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await Team.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, sportId, players, playerList, matchesPlayed, wins, losses, captain, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name required' });
    if (!sportId) return res.status(400).json({ success: false, message: 'sportId required' });
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }
    const sportDoc = await Sport.findById(sportId).lean();
    if (!sportDoc) return res.status(404).json({ success: false, message: 'Sport not found' });
    
    // Support both legacy 'players' count and new 'playerList' with details
    const finalPlayerList = Array.isArray(playerList) ? playerList : [];
    const playerCount = finalPlayerList.length || Number(players) || 0;
    
    // Validate player limit
    const playerLimit = sportDoc.playerLimit || 11;
    if (playerCount > playerLimit) {
      return res.status(400).json({ 
        success: false, 
        message: `${sportDoc.name} teams can have maximum ${playerLimit} players, but ${playerCount} were provided` 
      });
    }
    
    // Validate all players have names
    if (finalPlayerList.length > 0) {
      const invalidPlayers = finalPlayerList.filter(p => !p.name?.trim());
      if (invalidPlayers.length > 0) {
        return res.status(400).json({ success: false, message: 'All players must have names' });
      }
    }
    
    const doc = await Team.create({
      name: name.trim(),
      sport: sportId,
      players: playerCount,
      playerList: finalPlayerList,
      matchesPlayed: Number(matchesPlayed) || 0,
      wins: Number(wins) || 0,
      losses: Number(losses) || 0,
      captain,
      description,
    });
    res.status(201).json({ success: true, data: doc, message: 'Team created' });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { playerList } = req.body;
    const doc = await Team.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Team not found' });
    
    // If playerList is being updated, validate it
    if (Array.isArray(playerList)) {
      const sport = await Sport.findById(doc.sport).lean();
      const playerLimit = sport?.playerLimit || 11;
      
      if (playerList.length > playerLimit) {
        return res.status(400).json({ 
          success: false, 
          message: `Teams can have maximum ${playerLimit} players, but ${playerList.length} were provided` 
        });
      }
      
      const invalidPlayers = playerList.filter(p => !p.name?.trim());
      if (invalidPlayers.length > 0) {
        return res.status(400).json({ success: false, message: 'All players must have names' });
      }
    }
    
    const updated = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Team.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
}
