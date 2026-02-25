import Team from '../models/Team.js';

export async function list(req, res, next) {
  try {
    const { sport } = req.query;
    const filter = {};
    if (sport) filter.sport = sport.trim().toLowerCase();
    const list = await Team.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: list });
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
    const { name, sport, players, matches, wins, losses, captain, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const sportLower = (sport || req.sport || '').trim().toLowerCase();
    if (!sportLower) return res.status(400).json({ success: false, message: 'Sport required' });
    const doc = await Team.create({
      name,
      sport: sportLower,
      players: Number(players) || 0,
      matches: Number(matches) || 0,
      wins: Number(wins) || 0,
      losses: Number(losses) || 0,
      captain,
      description,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: doc });
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
