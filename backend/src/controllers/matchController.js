import mongoose from 'mongoose';
import Match from '../models/Match.js';
import Sport from '../models/Sport.js';
import Team from '../models/Team.js';

export async function list(req, res, next) {
  try {
    const { sportId } = req.query;
    if (!sportId) return res.status(400).json({ success: false, message: 'sportId query param is required' });
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }
    const list = await Match.find({ sport: sportId })
      .sort({ date: -1, time: -1, createdAt: -1 })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();
    res.json({ success: true, data: list, message: 'Matches fetched' });
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
    const { sportId, teamAId, teamBId, venue, date, time, status, scoreA, scoreB, oversA, oversB, extraInfo } = req.body;
    if (!sportId) return res.status(400).json({ success: false, message: 'sportId required' });
    if (!teamAId || !teamBId) return res.status(400).json({ success: false, message: 'teamAId and teamBId required' });
    if (!mongoose.Types.ObjectId.isValid(sportId)) return res.status(400).json({ success: false, message: 'Invalid sportId' });
    if (!mongoose.Types.ObjectId.isValid(teamAId) || !mongoose.Types.ObjectId.isValid(teamBId)) {
      return res.status(400).json({ success: false, message: 'Invalid team id(s)' });
    }
    if (teamAId === teamBId) return res.status(400).json({ success: false, message: 'Teams must be different' });

    const sportDoc = await Sport.findById(sportId).lean();
    if (!sportDoc) return res.status(404).json({ success: false, message: 'Sport not found' });

    const [teamA, teamB] = await Promise.all([
      Team.findById(teamAId).lean(),
      Team.findById(teamBId).lean(),
    ]);
    if (!teamA || !teamB) return res.status(404).json({ success: false, message: 'Team not found' });
    if (String(teamA.sport) !== String(sportId) || String(teamB.sport) !== String(sportId)) {
      return res.status(400).json({ success: false, message: 'Teams must belong to the selected sport' });
    }

    const doc = await Match.create({
      sport: sportId,
      teamA: teamAId,
      teamB: teamBId,
      venue,
      date,
      time,
      status: status || 'upcoming',
      scoreA: Number(scoreA) || 0,
      scoreB: Number(scoreB) || 0,
      oversA,
      oversB,
      extraInfo,
    });
    const populated = await Match.findById(doc._id).populate('teamA', 'name').populate('teamB', 'name').lean();
    const io = req.app.get('io');
    if (io) io.emit('matchCreated', populated);
    res.status(201).json({ success: true, data: populated, message: 'Match created' });
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

export async function updateScore(req, res, next) {
  try {
    const { scoreA, scoreB, status, oversA, oversB, sportScore } = req.body;
    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });

    if (sportScore !== undefined && sportScore !== null && typeof sportScore === 'object') {
      doc.sportScore = sportScore;
    }
    if (scoreA !== undefined) doc.scoreA = Number(scoreA);
    if (scoreB !== undefined) doc.scoreB = Number(scoreB);
    if (status) doc.status = status;
    if (oversA !== undefined) doc.oversA = oversA;
    if (oversB !== undefined) doc.oversB = oversB;

    await doc.save();
    const populated = await Match.findById(doc._id).populate('teamA', 'name').populate('teamB', 'name').lean();
    const io = req.app.get('io');
    if (io) io.emit('scoreUpdated', populated);
    res.json({ success: true, data: populated, message: 'Score updated' });
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
