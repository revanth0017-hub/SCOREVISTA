import mongoose from 'mongoose';
import Match from '../models/Match.js';
import Sport from '../models/Sport.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { updatePlayerStat } from '../utils/playerStatsTracker.js';

function calculateCricketTotals(innings) {
  const balls = Array.isArray(innings.balls) ? innings.balls : [];
  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;

  for (const ball of balls) {
    const runsScored = Number(ball.runsScored);
    if (!Number.isNaN(runsScored)) {
      totalRuns += runsScored;
    } else {
      switch (ball.event) {
        case 'runs-1': totalRuns += 1; break;
        case 'runs-2': totalRuns += 2; break;
        case 'runs-3': totalRuns += 3; break;
        case 'runs-4': totalRuns += 4; break;
        case 'runs-6': totalRuns += 6; break;
        case 'wide':
        case 'noBall':
        case 'legBye':
        case 'bye':
          totalRuns += 1;
          break;
        default:
          break;
      }
    }

    const isWicket = ball.isWicket === true || ball.event === 'wicket';
    const isExtra = ball.isExtra === true || ['wide', 'noBall', 'legBye', 'bye'].includes(ball.event);

    if (isWicket) totalWickets += 1;
    if (!isExtra) legalBalls += 1;
  }

  const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
  return { totalRuns, totalWickets, legalBalls, overs };
}

function isCricketInningsComplete(innings) {
  const { totalRuns, totalWickets } = calculateCricketTotals(innings);
  const overs = innings.overs || '0.0';
  const oversNum = parseInt(String(overs).split('.')[0], 10) || 0;
  return oversNum >= (innings.totalOvers || 20) || totalWickets >= 10;
}

// ============= GENERIC EVENT HANDLER FOR ALL SPORTS =============
export async function processEvent(req, res, next) {
  try {
    const { sportSlug, eventType, playerIds, data } = req.body;
    if (!sportSlug || !eventType) {
      return res.status(400).json({ success: false, message: 'sportSlug and eventType required' });
    }

    const doc = await Match.findById(req.params.id)
      .populate('sport', '_id slug name')
      .populate('teamA', '_id name sport')
      .populate('teamB', '_id name sport');
    
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    if (!doc.sport || doc.sport.slug !== sportSlug) {
      return res.status(400).json({ success: false, message: `This match is not a ${sportSlug} match` });
    }

    // Initialize sportScore if not exists
    if (!doc.sportScore || typeof doc.sportScore !== 'object') {
      doc.sportScore = { sportSlug, events: [] };
    }

    const event = {
      eventType,
      playerIds: Array.isArray(playerIds) ? playerIds : [],
      data: data || {},
      timestamp: new Date(),
    };

    if (!Array.isArray(doc.sportScore.events)) {
      doc.sportScore.events = [];
    }
    doc.sportScore.events.push(event);

    // Dispatch to sport-specific handler
    let updatePayload = {};
    switch (sportSlug) {
      case 'football':
        updatePayload = await handleFootballEvent(doc, event);
        break;
      case 'basketball':
        updatePayload = await handleBasketballEvent(doc, event);
        break;
      case 'tennis':
        updatePayload = await handleTennisEvent(doc, event);
        break;
      case 'volleyball':
        updatePayload = await handleVolleyballEvent(doc, event);
        break;
      case 'kabaddi':
        updatePayload = await handleKabaddiEvent(doc, event);
        break;
      case 'shuttle':
        updatePayload = await handleShuttleEvent(doc, event);
        break;
      default:
        updatePayload = { sportScore: doc.sportScore };
    }

    // Update player stats if playerIds provided
    if (Array.isArray(playerIds) && playerIds.length > 0) {
      await updatePlayerStats(playerIds, { sportSlug, eventType, data });
    }

    Object.assign(doc.sportScore, updatePayload);
    await doc.save();

    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('scoreUpdated', populated);
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }

    res.json({ success: true, data: populated, message: 'Event processed' });
  } catch (err) {
    next(err);
  }
}

// ============= PLAYER STAT UPDATE UTILITY =============
async function updatePlayerStats(playerIds, eventInfo) {
  try {
    const { sportSlug, eventType, data } = eventInfo;
    
    // Map event types to stat updates
    const statIncrements = {
      // Football
      'goal-field': 1,  // goals
      'goal-penalty': 1, // goals
      'goal-own': 1,  // ownGoals
      'assist': 1,    // assists
      'save': 1,      // saves
      'tackle': 1,    // tackles
      'foul': 1,      // fouls
      // Basketball
      'points-1': 1,  // points (x1)
      'points-2': 2,  // points (x2)
      'points-3': 3,  // points (x3)
      'rebound': 1,   // rebounds
      'assist': 1,    // assists
      'steal': 1,     // steals
      'block': 1,     // blocks
      'turnover': 1,  // turnovers
      'foul': 1,      // fouls
      // Tennis
      'point': 1,     // points
      'ace': 1,       // aces
      'doubleFault': 1, // doubleFaults
      'winner': 1,    // winners
      'unforced': 1,  // unforcedErrors
      'setWon': 1,    // setsWon
      'gameWon': 1,   // gamesWon
      // Volleyball
      'point-spike': 1, // points
      'point-block': 1, // points
      'point-serve': 1, // points
      'ace': 1,       // aces
      'kill': 1,      // kills
      'block': 1,     // blocks
      'error': 1,     // errors
      'set': 1,       // sets
      'dig': 1,       // digs
      // Kabaddi
      'raid-point': 1, // raidPoints
      'tackle': 1,     // tackles
      'foul': 1,       // fouls
      'bonus': 1,      // bonus
      'allOut': 1,     // allOuts
      // Cricket
      'wicket': 1,     // wickets
      'runs-1': 1,     // runs
      'runs-2': 2,     // runs
      'runs-3': 3,     // runs
      'runs-4': 4,     // runs
      'runs-6': 6,     // runs
      'wide': 1,       // wides
      'noBall': 1,     // noBalls
      // Shuttle
      'point': 1,      // points
      'service-error': 1, // serviceErrors
      'winner': 1,     // winners
      'unforced': 1,   // unforcedErrors
      'gameWon': 1,    // gamesWon
      'rally': 1,      // rallies
    };

    const increment = statIncrements[eventType] || 1;

    for (const playerId of playerIds) {
      if (playerId && mongoose.Types.ObjectId.isValid(playerId)) {
        await updatePlayerStat(playerId, sportSlug, eventType, increment);
      }
    }
  } catch (err) {
    console.error('Player stat update error:', err);
  }
}

// ============= FOOTBALL EVENT HANDLER =============
async function handleFootballEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.football) {
    match.sportScore.football = {
      teamA: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
      teamB: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
      period: 1,
      minute: 0,
    };
  }

  const team = data?.team === 'A' ? match.sportScore.football.teamA : match.sportScore.football.teamB;
  
  switch (eventType) {
    case 'goal':
      team.goals += 1;
      match.scoreA = match.sportScore.football.teamA.goals;
      match.scoreB = match.sportScore.football.teamB.goals;
      break;
    case 'yellow':
      team.yellows += 1;
      break;
    case 'red':
      team.reds += 1;
      break;
    case 'shot':
      team.shots += 1;
      break;
    case 'period-end':
      match.sportScore.football.period += 1;
      break;
  }

  return { sportScore: match.sportScore };
}

// ============= BASKETBALL EVENT HANDLER =============
async function handleBasketballEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.basketball) {
    match.sportScore.basketball = {
      teamA: { points: 0, quarter: 1, fouls: 0 },
      teamB: { points: 0, quarter: 1, fouls: 0 },
    };
  }

  const team = data?.team === 'A' ? match.sportScore.basketball.teamA : match.sportScore.basketball.teamB;

  switch (eventType) {
    case '1point':
      team.points += 1;
      break;
    case '2point':
      team.points += 2;
      break;
    case '3point':
      team.points += 3;
      break;
    case 'foul':
      team.fouls += 1;
      break;
    case 'quarter-end':
      match.sportScore.basketball.teamA.quarter += 1;
      match.sportScore.basketball.teamB.quarter += 1;
      break;
  }

  match.scoreA = match.sportScore.basketball.teamA.points;
  match.scoreB = match.sportScore.basketball.teamB.points;
  return { sportScore: match.sportScore };
}

// ============= TENNIS EVENT HANDLER =============
async function handleTennisEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.tennis) {
    match.sportScore.tennis = {
      teamA: { sets: [], games: [], currentPoints: 0 },
      teamB: { sets: [], games: [], currentPoints: 0 },
      currentSet: 1,
      currentGame: 1,
    };
  }

  const tennis = match.sportScore.tennis;
  const player = data?.team === 'A' ? tennis.teamA : tennis.teamB;
  const opponent = data?.team === 'A' ? tennis.teamB : tennis.teamA;

  switch (eventType) {
    case 'point':
      player.currentPoints += 1;
      // Check for game win (4+ points and lead by 2)
      if (player.currentPoints >= 4 && player.currentPoints - opponent.currentPoints >= 2) {
        player.games.push(player.currentPoints);
        opponent.games.push(opponent.currentPoints);
        player.currentPoints = 0;
        opponent.currentPoints = 0;
        // Check for set win (6+ games and lead by 2)
        if (player.games.length >= 6 && player.games.length - opponent.games.length >= 2) {
          player.sets.push(player.games.length);
          opponent.sets.push(opponent.games.length);
          player.games = [];
          opponent.games = [];
          tennis.currentSet += 1;
          tennis.currentGame = 1;
        }
      }
      break;
    case 'deuce':
      player.currentPoints = 3;
      opponent.currentPoints = 3;
      break;
    case 'advantage':
      player.currentPoints = 4;
      opponent.currentPoints = 3;
      break;
  }

  match.scoreA = tennis.teamA.sets.length;
  match.scoreB = tennis.teamB.sets.length;
  return { sportScore: match.sportScore };
}

// ============= VOLLEYBALL EVENT HANDLER =============
async function handleVolleyballEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.volleyball) {
    match.sportScore.volleyball = {
      teamA: { sets: [], points: 0, currentSet: 0 },
      teamB: { sets: [], points: 0, currentSet: 0 },
    };
  }

  const team = data?.team === 'A' ? match.sportScore.volleyball.teamA : match.sportScore.volleyball.teamB;
  const opponent = data?.team === 'A' ? match.sportScore.volleyball.teamB : match.sportScore.volleyball.teamA;

  switch (eventType) {
    case 'point':
      team.points += 1;
      // Set win at 25 points (or 15 in deciding set) with 2+ lead
      const setWinTarget = team.sets.length === 4 ? 15 : 25;
      if (team.points >= setWinTarget && team.points - opponent.points >= 2) {
        team.sets.push(team.points);
        opponent.sets.push(opponent.points);
        team.points = 0;
        opponent.points = 0;
      }
      break;
    case 'ace':
      team.points += 1;
      break;
  }

  match.scoreA = match.sportScore.volleyball.teamA.sets.length;
  match.scoreB = match.sportScore.volleyball.teamB.sets.length;
  return { sportScore: match.sportScore };
}

// ============= KABADDI EVENT HANDLER =============
async function handleKabaddiEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.kabaddi) {
    match.sportScore.kabaddi = {
      teamA: { points: 0, raids: 0, tackles: 0 },
      teamB: { points: 0, raids: 0, tackles: 0 },
    };
  }

  const team = data?.team === 'A' ? match.sportScore.kabaddi.teamA : match.sportScore.kabaddi.teamB;

  switch (eventType) {
    case 'point':
      team.points += data?.value || 1;
      break;
    case 'raid':
      team.raids += 1;
      break;
    case 'tackle':
      team.tackles += 1;
      break;
  }

  match.scoreA = match.sportScore.kabaddi.teamA.points;
  match.scoreB = match.sportScore.kabaddi.teamB.points;
  return { sportScore: match.sportScore };
}

// ============= SHUTTLE/BADMINTON EVENT HANDLER =============
async function handleShuttleEvent(match, event) {
  const { eventType, data } = event;
  if (!match.sportScore.shuttle) {
    match.sportScore.shuttle = {
      teamA: { sets: [], points: 0 },
      teamB: { sets: [], points: 0 },
    };
  }

  const team = data?.team === 'A' ? match.sportScore.shuttle.teamA : match.sportScore.shuttle.teamB;
  const opponent = data?.team === 'A' ? match.sportScore.shuttle.teamB : match.sportScore.shuttle.teamA;

  switch (eventType) {
    case 'point':
      team.points += 1;
      // Set win at 21 points (or 11 in deciding) with 2+ lead
      const setWinTarget = team.sets.length === 2 ? 11 : 21;
      if (team.points >= setWinTarget && team.points - opponent.points >= 2) {
        team.sets.push(team.points);
        opponent.sets.push(opponent.points);
        team.points = 0;
        opponent.points = 0;
      }
      break;
    case 'ace':
      team.points += 1;
      break;
  }

  match.scoreA = match.sportScore.shuttle.teamA.sets.length;
  match.scoreB = match.sportScore.shuttle.teamB.sets.length;
  return { sportScore: match.sportScore };
}

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
    const { sportId, teamAId, teamBId, venue, date, time, status, scoreA, scoreB, oversA, oversB, extraInfo, totalOvers } = req.body;
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

    const matchPayload = {
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
    };

    // Initialize sportScore based on sport type
    const slug = sportDoc.slug;
    matchPayload.sportScore = {
      sportSlug: slug,
      events: [],
    };

    if (slug === 'cricket') {
      matchPayload.sportScore.currentInningsNum = 1;
      matchPayload.sportScore.innings = [
        {
          inningsNum: 1,
          battingTeamId: teamAId,
          bowlingTeamId: teamBId,
          runs: 0,
          wickets: 0,
          overs: '0.0',
          balls: [],
          status: 'not-started',
          totalOvers: Number(totalOvers) || 20,
        },
      ];
    } else if (slug === 'football') {
      matchPayload.sportScore.football = {
        teamA: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
        teamB: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
        period: 1,
      };
    } else if (slug === 'basketball') {
      matchPayload.sportScore.basketball = {
        teamA: { points: 0, quarter: 1, fouls: 0 },
        teamB: { points: 0, quarter: 1, fouls: 0 },
      };
    } else if (slug === 'tennis') {
      matchPayload.sportScore.tennis = {
        teamA: { sets: [], games: [], currentPoints: 0 },
        teamB: { sets: [], games: [], currentPoints: 0 },
        currentSet: 1,
      };
    } else if (slug === 'volleyball') {
      matchPayload.sportScore.volleyball = {
        teamA: { sets: [], points: 0 },
        teamB: { sets: [], points: 0 },
      };
    } else if (slug === 'kabaddi') {
      matchPayload.sportScore.kabaddi = {
        teamA: { points: 0, raids: 0, tackles: 0 },
        teamB: { points: 0, raids: 0, tackles: 0 },
      };
    } else if (slug === 'shuttle') {
      matchPayload.sportScore.shuttle = {
        teamA: { sets: [], points: 0 },
        teamB: { sets: [], points: 0 },
      };
    }

    const doc = await Match.create(matchPayload);
    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();
    
    const io = req.app.get('io');
    if (io) {
      // Emit to all users (legacy)
      io.emit('matchCreated', populated);
      // Also emit to sport-specific room
      io.to(`sport:${sportId}`).emit('matchCreated', populated);
    }
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
      if (
        doc.sportScore?.sportSlug === 'cricket' &&
        sportScore.sportSlug === 'cricket' &&
        Array.isArray(sportScore.innings) &&
        sportScore.innings.length > 0
      ) {
        const incomingInnings = sportScore.innings[0];
        const incomingInningsNum =
          incomingInnings.inningsNum || sportScore.currentInningsNum || doc.sportScore.currentInningsNum || 1;
        const existingInnings = Array.isArray(doc.sportScore.innings) ? doc.sportScore.innings : [];
        const mergedInnings = existingInnings.filter((i) => i.inningsNum !== incomingInningsNum);
        mergedInnings.push({
          ...incomingInnings,
          inningsNum: incomingInningsNum,
          totalOvers:
            incomingInnings.totalOvers ||
            existingInnings.find((i) => i.inningsNum === incomingInningsNum)?.totalOvers ||
            20,
        });
        doc.sportScore = {
          ...doc.sportScore,
          ...sportScore,
          innings: mergedInnings,
          currentInningsNum: sportScore.currentInningsNum || incomingInnings.inningsNum || doc.sportScore.currentInningsNum || 1,
        };
      } else {
        doc.sportScore = sportScore;
      }
    }
    if (scoreA !== undefined) doc.scoreA = Number(scoreA);
    if (scoreB !== undefined) doc.scoreB = Number(scoreB);
    if (status) doc.status = status;
    if (oversA !== undefined) doc.oversA = oversA;
    if (oversB !== undefined) doc.oversB = oversB;

    await doc.save();
    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();
    
    const io = req.app.get('io');
    if (io) {
      // Emit to all users (legacy)
      io.emit('scoreUpdated', populated);
      // Also emit to sport-specific room for real-time per-sport updates
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }
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

/**
 * Process a single cricket ball event
 * POST /api/matches/:id/cricket-ball
 * Body: { event, runs, wickets, overs, totalBalls }
 */
export async function processCricketBall(req, res, next) {
  try {
    const { event, runs, wickets, overs, totalBalls, totalOvers } = req.body;
    if (!event) {
      return res.status(400).json({ success: false, message: 'Ball event required' });
    }

    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });

    // Ensure sportScore structure exists
    if (!doc.sportScore || typeof doc.sportScore !== 'object') {
      doc.sportScore = {
        sportSlug: 'cricket',
        currentInningsNum: 1,
        innings: [
          {
            inningsNum: 1,
            runs: 0,
            wickets: 0,
            overs: '0.0',
            balls: [],
            status: 'live',
          },
        ],
      };
    }

    // Get current innings
    const currentInningsNum = doc.sportScore.currentInningsNum || 1;
    let innings = doc.sportScore.innings?.find((i) => i.inningsNum === currentInningsNum);

    if (!innings) {
      innings = {
        inningsNum: currentInningsNum,
        runs: 0,
        wickets: 0,
        overs: '0.0',
        balls: [],
        status: 'live',
      };
      if (!doc.sportScore.innings) doc.sportScore.innings = [];
      doc.sportScore.innings.push(innings);
    }

    // Add ball to history (always initialize as empty array if not exists)
    if (!Array.isArray(innings.balls)) {
      innings.balls = [];
    }

    const totalOversFromBody = Number(totalOvers);
    if (!Number.isNaN(totalOversFromBody) && totalOversFromBody > 0) {
      innings.totalOvers = totalOversFromBody;
    }

    innings.balls.push({
      event,
      runsScored: Number(runs || 0),
      isWicket: event === 'wicket',
      isExtra: ['wide', 'noBall', 'legBye', 'bye'].includes(event),
      timestamp: new Date(),
    });

    const totals = calculateCricketTotals(innings);
    innings.runs = totals.totalRuns;
    innings.wickets = Math.min(totals.totalWickets, 10);
    innings.overs = totals.overs;
    innings.status = isCricketInningsComplete(innings) ? 'completed' : 'live';

    // Update legacy fields for backward compatibility
    if (currentInningsNum === 1) {
      doc.scoreA = innings.runs;
      doc.oversA = innings.overs;
    } else {
      doc.scoreB = innings.runs;
      doc.oversB = innings.overs;
    }
    doc.status = 'live';

    await doc.save();

    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();

    const io = req.app.get('io');
    if (io) {
      // Real-time emission to all connected clients
      io.emit('cricketBallProcessed', {
        matchId: doc._id,
        event,
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
        inningsNum: currentInningsNum,
        timestamp: new Date(),
      });
      // Also emit full match update
      io.emit('scoreUpdated', populated);
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }

    res.json({
      success: true,
      data: populated,
      message: 'Ball processed',
      inningsData: {
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Undo last cricket ball
 * POST /api/matches/:id/cricket-ball-undo
 * Body: { runs, wickets, overs, totalBalls }
 */
export async function undoCricketBall(req, res, next) {
  try {
    const { runs, wickets, overs } = req.body;

    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });

    // Ensure sportScore structure exists
    if (!doc.sportScore || typeof doc.sportScore !== 'object') {
      doc.sportScore = {
        sportSlug: 'cricket',
        currentInningsNum: 1,
        innings: [{ inningsNum: 1, runs: 0, wickets: 0, overs: '0.0', balls: [], status: 'live', totalOvers: 20 }],
      };
    }

    // Get current innings
    const currentInningsNum = doc.sportScore?.currentInningsNum || 1;
    let innings = doc.sportScore?.innings?.find((i) => i.inningsNum === currentInningsNum);

    if (!innings) {
      innings = {
        inningsNum: currentInningsNum,
        runs: 0,
        wickets: 0,
        overs: '0.0',
        balls: [],
        status: 'live',
        totalOvers: 20,
      };
      if (!Array.isArray(doc.sportScore.innings)) doc.sportScore.innings = [];
      doc.sportScore.innings.push(innings);
    }

    // Remove last ball from history
    if (!Array.isArray(innings.balls)) {
      innings.balls = [];
    }
    if (innings.balls.length > 0) {
      innings.balls.pop();
    }

    const totals = calculateCricketTotals(innings);
    innings.runs = totals.totalRuns;
    innings.wickets = Math.min(totals.totalWickets, 10);
    innings.overs = totals.overs;
    innings.status = isCricketInningsComplete(innings) ? 'completed' : 'live';

    // Update legacy fields
    if (currentInningsNum === 1) {
      doc.scoreA = innings.runs;
      doc.oversA = innings.overs;
    } else {
      doc.scoreB = innings.runs;
      doc.oversB = innings.overs;
    }

    await doc.save();

    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('cricketBallUndone', {
        matchId: doc._id,
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
        inningsNum: currentInningsNum,
        timestamp: new Date(),
      });
      io.emit('scoreUpdated', populated);
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }

    res.json({
      success: true,
      data: populated,
      message: 'Ball undone',
      inningsData: {
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Start the second cricket innings.
 * POST /api/matches/:id/cricket-start-innings
 */
export async function startCricketSecondInnings(req, res, next) {
  try {
    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    if (!doc.sportScore || doc.sportScore.sportSlug !== 'cricket') {
      return res.status(400).json({ success: false, message: 'This match is not a cricket match' });
    }

    const firstInnings = Array.isArray(doc.sportScore.innings)
      ? doc.sportScore.innings.find((i) => i.inningsNum === 1)
      : null;
    if (!firstInnings) {
      return res.status(400).json({ success: false, message: 'First innings data missing' });
    }
    
    // Check if first innings is actually complete (either by status flag or by overs/wickets)
    const isFirstInningsComplete = firstInnings.status === 'completed' || isCricketInningsComplete(firstInnings);
    console.log(`Checking first innings: status=${firstInnings.status}, overs=${firstInnings.overs}/${firstInnings.totalOvers}, wickets=${firstInnings.wickets}/10, complete=${isFirstInningsComplete}`);
    if (!isFirstInningsComplete) {
      return res.status(400).json({ 
        success: false, 
        message: `First innings is not complete. Status: ${firstInnings.status}, Overs: ${firstInnings.overs}/${firstInnings.totalOvers || 20}, Wickets: ${firstInnings.wickets}/10` 
      });
    }

    if (!Array.isArray(doc.sportScore.innings)) {
      doc.sportScore.innings = [];
    }

    let secondInnings = doc.sportScore.innings.find((i) => i.inningsNum === 2);
    if (!secondInnings) {
      secondInnings = {
        inningsNum: 2,
        battingTeamId: firstInnings.bowlingTeamId || doc.teamB,
        bowlingTeamId: firstInnings.battingTeamId || doc.teamA,
        balls: [],
        runs: 0,
        wickets: 0,
        overs: '0.0',
        status: 'live',
        target: Number(firstInnings.runs || 0) + 1,
        totalOvers: firstInnings.totalOvers || 20,
      };
      doc.sportScore.innings.push(secondInnings);
    } else {
      secondInnings.status = 'live';
    }

    doc.sportScore.currentInningsNum = 2;
    doc.status = 'live';

    await doc.save();

    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('cricketSecondInningsStarted', { matchId: doc._id, currentInningsNum: 2 });
      io.emit('scoreUpdated', populated);
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }

    res.json({ success: true, data: populated, message: 'Second innings started' });
  } catch (err) {
    next(err);
  }
}

/**
 * Undo last event for any sport
 * POST /api/matches/:id/event-undo
 */
export async function undoEvent(req, res, next) {
  try {
    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });
    
    if (!doc.sportScore || !Array.isArray(doc.sportScore.events) || doc.sportScore.events.length === 0) {
      return res.status(400).json({ success: false, message: 'No events to undo' });
    }

    const lastEvent = doc.sportScore.events.pop();
    
    // Recalculate score based on remaining events
    const sportScore = { sportSlug: doc.sportScore.sportSlug, events: doc.sportScore.events };
    
    switch (doc.sportScore.sportSlug) {
      case 'football':
        recalculateFootballScore(sportScore);
        break;
      case 'basketball':
        recalculateBasketballScore(sportScore);
        break;
      case 'tennis':
        recalculateTennisScore(sportScore);
        break;
      case 'volleyball':
        recalculateVolleyballScore(sportScore);
        break;
      case 'kabaddi':
        recalculateKabaddiScore(sportScore);
        break;
      case 'shuttle':
        recalculateShuttleScore(sportScore);
        break;
    }

    doc.sportScore = sportScore;
    await doc.save();

    const populated = await Match.findById(doc._id)
      .populate('sport', '_id slug name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('eventUndone', { matchId: doc._id, event: lastEvent });
      io.emit('scoreUpdated', populated);
      if (populated.sport?._id) {
        io.to(`sport:${populated.sport._id}`).emit('scoreUpdated', populated);
      }
    }

    res.json({ success: true, data: populated, message: 'Event undone' });
  } catch (err) {
    next(err);
  }
}

// Recalculation helper functions
function recalculateFootballScore(sportScore) {
  sportScore.football = { 
    teamA: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
    teamB: { goals: 0, possession: 0, shots: 0, yellows: 0, reds: 0 },
    period: 1,
    minute: 0,
  };
  for (const e of sportScore.events) {
    const team = e.data?.team === 'A' ? sportScore.football.teamA : sportScore.football.teamB;
    if (e.eventType === 'goal') team.goals += 1;
    else if (e.eventType === 'yellow') team.yellows += 1;
    else if (e.eventType === 'red') team.reds += 1;
    else if (e.eventType === 'shot') team.shots += 1;
    else if (e.eventType === 'period-end') sportScore.football.period += 1;
  }
}

function recalculateBasketballScore(sportScore) {
  sportScore.basketball = {
    teamA: { points: 0, quarter: 1, fouls: 0 },
    teamB: { points: 0, quarter: 1, fouls: 0 },
  };
  for (const e of sportScore.events) {
    const team = e.data?.team === 'A' ? sportScore.basketball.teamA : sportScore.basketball.teamB;
    if (e.eventType === '1point') team.points += 1;
    else if (e.eventType === '2point') team.points += 2;
    else if (e.eventType === '3point') team.points += 3;
    else if (e.eventType === 'foul') team.fouls += 1;
    else if (e.eventType === 'quarter-end') {
      sportScore.basketball.teamA.quarter += 1;
      sportScore.basketball.teamB.quarter += 1;
    }
  }
}

function recalculateTennisScore(sportScore) {
  sportScore.tennis = {
    teamA: { sets: [], games: [], currentPoints: 0 },
    teamB: { sets: [], games: [], currentPoints: 0 },
    currentSet: 1,
    currentGame: 1,
  };
  for (const e of sportScore.events) {
    const player = e.data?.team === 'A' ? sportScore.tennis.teamA : sportScore.tennis.teamB;
    const opponent = e.data?.team === 'A' ? sportScore.tennis.teamB : sportScore.tennis.teamA;
    if (e.eventType === 'point') player.currentPoints += 1;
    else if (e.eventType === 'deuce') { player.currentPoints = 3; opponent.currentPoints = 3; }
  }
}

function recalculateVolleyballScore(sportScore) {
  sportScore.volleyball = {
    teamA: { sets: [], points: 0, currentSet: 0 },
    teamB: { sets: [], points: 0, currentSet: 0 },
  };
  for (const e of sportScore.events) {
    const team = e.data?.team === 'A' ? sportScore.volleyball.teamA : sportScore.volleyball.teamB;
    if (e.eventType === 'point' || e.eventType === 'ace') team.points += 1;
  }
}

function recalculateKabaddiScore(sportScore) {
  sportScore.kabaddi = {
    teamA: { points: 0, raids: 0, tackles: 0 },
    teamB: { points: 0, raids: 0, tackles: 0 },
  };
  for (const e of sportScore.events) {
    const team = e.data?.team === 'A' ? sportScore.kabaddi.teamA : sportScore.kabaddi.teamB;
    if (e.eventType === 'point') team.points += e.data?.value || 1;
    else if (e.eventType === 'raid') team.raids += 1;
    else if (e.eventType === 'tackle') team.tackles += 1;
  }
}

function recalculateShuttleScore(sportScore) {
  sportScore.shuttle = {
    teamA: { sets: [], points: 0 },
    teamB: { sets: [], points: 0 },
  };
  for (const e of sportScore.events) {
    const team = e.data?.team === 'A' ? sportScore.shuttle.teamA : sportScore.shuttle.teamB;
    if (e.eventType === 'point' || e.eventType === 'ace') team.points += 1;
  }
}

/**
 * Get match player stats
 * GET /api/matches/:id/player-stats
 */
export async function getMatchPlayerStats(req, res, next) {
  try {
    const doc = await Match.findById(req.params.id)
      .populate('teamA', '_id name')
      .populate('teamB', '_id name');
    
    if (!doc) return res.status(404).json({ success: false, message: 'Match not found' });

    const [teamAPlayers, teamBPlayers] = await Promise.all([
      Player.find({ team: doc.teamA._id }).lean(),
      Player.find({ team: doc.teamB._id }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        match: { id: doc._id, teamA: doc.teamA, teamB: doc.teamB },
        teamA: teamAPlayers,
        teamB: teamBPlayers,
      },
    });
  } catch (err) {
    next(err);
  }
}
