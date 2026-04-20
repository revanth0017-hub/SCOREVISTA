/**
 * Player Score Tracker - Updates individual player stats for all sports
 * Provides sport-specific stat calculation and update logic
 */

import Player from '../models/Player.js';
import Team from '../models/Team.js';

const SPORT_STATS = {
  cricket: {
    events: ['runs-1', 'runs-2', 'runs-3', 'runs-4', 'runs-6', 'wicket', 'wide', 'noBall'],
    statFields: {
      'runs-1': 'runs',
      'runs-2': 'runs',
      'runs-3': 'runs',
      'runs-4': 'runs',
      'runs-6': 'runs',
      'wicket': 'wickets',
      'wide': 'wides',
      'noBall': 'noBalls',
    },
  },
  football: {
    events: ['goal-own', 'goal-penalty', 'goal-field', 'assist', 'save', 'tackle', 'foul'],
    statFields: {
      'goal-field': 'goals',
      'goal-penalty': 'goals',
      'goal-own': 'ownGoals',
      'assist': 'assists',
      'save': 'saves',
      'tackle': 'tackles',
      'foul': 'fouls',
    },
  },
  basketball: {
    events: ['points-1', 'points-2', 'points-3', 'rebound', 'assist', 'steal', 'block', 'turnover', 'foul'],
    statFields: {
      'points-1': 'points',
      'points-2': 'points',
      'points-3': 'points',
      'rebound': 'rebounds',
      'assist': 'assists',
      'steal': 'steals',
      'block': 'blocks',
      'turnover': 'turnovers',
      'foul': 'fouls',
    },
  },
  volleyball: {
    events: ['point-spike', 'point-block', 'point-serve', 'ace', 'kill', 'block', 'error', 'set', 'dig'],
    statFields: {
      'point-spike': 'points',
      'point-block': 'points',
      'point-serve': 'points',
      'ace': 'aces',
      'kill': 'kills',
      'block': 'blocks',
      'error': 'errors',
      'set': 'sets',
      'dig': 'digs',
    },
  },
  tennis: {
    events: ['point', 'ace', 'doubleFault', 'winner', 'unforced', 'setWon', 'gameWon'],
    statFields: {
      'point': 'points',
      'ace': 'aces',
      'doubleFault': 'doubleFaults',
      'winner': 'winners',
      'unforced': 'unforcedErrors',
      'setWon': 'setsWon',
      'gameWon': 'gamesWon',
    },
  },
  kabaddi: {
    events: ['tackle', 'raid-point', 'foul', 'bonus', 'allOut'],
    statFields: {
      'raid-point': 'raidPoints',
      'tackle': 'tackles',
      'foul': 'fouls',
      'bonus': 'bonus',
      'allOut': 'allOuts',
    },
  },
  shuttle: {
    events: ['point', 'service-error', 'winner', 'unforced', 'gameWon', 'rally'],
    statFields: {
      'point': 'points',
      'service-error': 'serviceErrors',
      'winner': 'winners',
      'unforced': 'unforcedErrors',
      'gameWon': 'gamesWon',
      'rally': 'rallies',
    },
  },
};

/**
 * Update a player's individual stats based on a match event
 * @param {string} playerId - Player ID
 * @param {string} sport - Sport slug
 * @param {string} eventType - Event type
 * @param {number} increment - Increment amount (default 1)
 */
export async function updatePlayerStat(playerId, sport, eventType, increment = 1) {
  if (!playerId || !sport || !eventType) return;

  const sportConfig = SPORT_STATS[sport.toLowerCase()];
  if (!sportConfig) return;

  const statField = sportConfig.statFields[eventType];
  if (!statField) return;

  try {
    const updateObj = {};
    updateObj[`stats.${statField}`] = increment;

    await Player.findByIdAndUpdate(
      playerId,
      { $inc: updateObj },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating player stat for ${sport}/${eventType}:`, error);
  }
}

/**
 * Update multiple players' stats in bulk
 * @param {Array} playerUpdates - Array of {playerId, sport, eventType, increment}
 */
export async function bulkUpdatePlayerStats(playerUpdates) {
  for (const update of playerUpdates) {
    await updatePlayerStat(
      update.playerId,
      update.sport,
      update.eventType,
      update.increment || 1
    );
  }
}

/**
 * Get player stats for a specific sport
 * @param {string} teamId - Team ID
 * @param {string} sport - Sport slug
 */
export async function getTeamPlayerStats(teamId, sport) {
  try {
    const team = await Team.findById(teamId).lean();
    if (!team || !Array.isArray(team.playerList)) return [];

    const playerIds = team.playerList.map(p => p._id).filter(Boolean);
    if (playerIds.length === 0) return [];

    const players = await Player.find({ _id: { $in: playerIds } }).lean();
    return players;
  } catch (error) {
    console.error('Error fetching team player stats:', error);
    return [];
  }
}

/**
 * Initialize player stats for a team
 * @param {string} teamId - Team ID
 * @param {string} sport - Sport slug
 */
export async function initializeTeamPlayerStats(teamId, sport) {
  try {
    const team = await Team.findById(teamId).populate('playerList');
    if (!team || !Array.isArray(team.playerList)) return;

    const sportConfig = SPORT_STATS[sport.toLowerCase()] || {};

    // Create/update Player documents for each team member
    for (const player of team.playerList) {
      const stats = {};
      Object.values(sportConfig.statFields || {}).forEach(field => {
        stats[field] = 0;
      });

      await Player.updateOne(
        { _id: player._id },
        {
          $set: {
            name: player.name,
            team: teamId,
            sport,
            number: player.number,
            role: player.role,
            stats,
          },
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error initializing team player stats:', error);
  }
}

export default {
  updatePlayerStat,
  bulkUpdatePlayerStats,
  getTeamPlayerStats,
  initializeTeamPlayerStats,
  SPORT_STATS,
};
