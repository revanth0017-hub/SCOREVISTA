import Match from '../models/Match.js';

export async function list(req, res, next) {
  try {
    const { sport, status } = req.query;
    const filter = {};
    if (sport) filter.sport = sport.trim().toLowerCase();
    if (status) filter.status = status;
    const list = await Match.find(filter).sort({ date: -1, time: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await Match.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { team1, team2, sport, venue, date, time, status, score1, score2, overs1, overs2, extraInfo } = req.body;
    if (!team1 || !team2) return res.status(400).json({ success: false, message: 'Team names required' });
    const sportLower = (sport || req.sport || '').trim().toLowerCase();
    if (!sportLower) return res.status(400).json({ success: false, message: 'Sport required' });
    const doc = await Match.create({
      team1,
      team2,
      sport: sportLower,
      venue,
      date,
      time,
      status: status || 'upcoming',
      score1: Number(score1) || 0,
      score2: Number(score2) || 0,
      overs1,
      overs2,
      extraInfo,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function updateLiveScore(req, res, next) {
  try {
    const { score1, score2, status, overs1, overs2 } = req.body;
    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    if (req.role === 'admin' && req.sport && doc.sport !== req.sport) {
      return res.status(403).json({ success: false, message: 'Access limited to your assigned sport' });
    }
    if (score1 !== undefined) doc.score1 = Number(score1);
    if (score2 !== undefined) doc.score2 = Number(score2);
    if (status) doc.status = status;
    if (overs1 !== undefined) doc.overs1 = overs1;
    if (overs2 !== undefined) doc.overs2 = overs2;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Match.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    res.json({ success: true, message: 'Match deleted' });
  } catch (err) {
    next(err);
  }
}
