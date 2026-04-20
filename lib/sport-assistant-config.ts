/**
 * Sport-specific assistant flow configurations and prompts
 * Used to dynamically customize assistant workflows based on sport
 */

export type SportSlug = 'cricket' | 'football' | 'basketball' | 'tennis' | 'volleyball' | 'kabaddi' | 'shuttle';

export interface SportFlowConfig {
  sportSlug: SportSlug;
  name: string;
  updateScorePrompt: string;
  createMatchPrompt: string;
  manageTeamPrompt: string;
  addHighlightPrompt: string;
}

export const CRICKET_FLOW: SportFlowConfig = {
  sportSlug: 'cricket',
  name: '🏏 Cricket',
  updateScorePrompt: `Ball-by-ball update:
  
Click quick buttons: [1] [2] [3] [4] [6] [W] [WD] [NB] [LB] [BYE]

Or use the score form below to enter full stats.
  
Step 2 — Enter team scores, wickets, and overs (e.g. 4.2 means 4 overs, 2 balls).`,
  createMatchPrompt: 'Step 1 — Enter Team A name.',
  manageTeamPrompt: 'Step 1 — Enter team name.',
  addHighlightPrompt: 'Step 1 — Enter a short highlight title.',
};

export const FOOTBALL_FLOW: SportFlowConfig = {
  sportSlug: 'football',
  name: '⚽ Football',
  updateScorePrompt: `Update match score:

Use quick buttons [+ Goal A] [+ Goal B] to increment goals.

Set match phase: [1st Half] [Half Time] [2nd Half] [Full Time]

Or enter goals directly in the form below.`,
  createMatchPrompt: 'Step 1 — Enter Team A name.',
  manageTeamPrompt: 'Step 1 — Enter team name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title (e.g. "Winning Goal", "Best Saves").',
};

export const BASKETBALL_FLOW: SportFlowConfig = {
  sportSlug: 'basketball',
  name: '🏀 Basketball',
  updateScorePrompt: `Update points:

Use quick buttons: [+1 Point] [+2 Points] [+3 Points]

Set current quarter: [Q1] [Q2] [Q3] [Q4]

Or enter points directly in the form.`,
  createMatchPrompt: 'Step 1 — Enter Team A name.',
  manageTeamPrompt: 'Step 1 — Enter team name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title (e.g. "3-Pointer", "Dunk").',
};

export const TENNIS_FLOW: SportFlowConfig = {
  sportSlug: 'tennis',
  name: '🎾 Tennis',
  updateScorePrompt: `Set-by-set scoring:

Use quick buttons for game points: [0] [15] [30] [40] [Deuce] [Ad-A] [Ad-B]

Enter completed sets in format: 6-4, 6-2, etc.

Use form to enter all set scores.`,
  createMatchPrompt: 'Step 1 — Enter Team A (Player/Pair A) name.',
  manageTeamPrompt: 'Step 1 — Enter player/pair name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title (e.g. "Match Highlights", "Best Rally").',
};

export const VOLLEYBALL_FLOW: SportFlowConfig = {
  sportSlug: 'volleyball',
  name: '🏐 Volleyball',
  updateScorePrompt: `Set-by-set scoring (rally score to 25):

Use quick buttons: [+ Point A] [+ Point B] [Next Set]

Or enter set scores: 25-23, 24-26, etc.

Form supports up to 5 sets.`,
  createMatchPrompt: 'Step 1 — Enter Team A name.',
  manageTeamPrompt: 'Step 1 — Enter team name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title (e.g. "Match Highlights").',
};

export const KABADDI_FLOW: SportFlowConfig = {
  sportSlug: 'kabaddi',
  name: '👥 Kabaddi',
  updateScorePrompt: `Raid and tackle points:

Use quick buttons:
[🏃 Raid A] [🤝 Tackle A]
[🏃 Raid B] [🤝 Tackle B]

Form shows: raid points, tackle points, total points.`,
  createMatchPrompt: 'Step 1 — Enter Team A name.',
  manageTeamPrompt: 'Step 1 — Enter team name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title.',
};

export const SHUTTLE_FLOW: SportFlowConfig = {
  sportSlug: 'shuttle',
  name: '🏸 Badminton',
  updateScorePrompt: `Set-wise scoring (Set A, B, C):

Step 1 — Select set: [Set A] [Set B] [Set C]

Step 2 — Point buttons: [+A] [+B]

Rally to 21 per set. Real-time point tracking.`,
  createMatchPrompt: 'Step 1 — Enter Player A name.',
  manageTeamPrompt: 'Step 1 — Enter player name.',
  addHighlightPrompt: 'Step 1 — Enter highlight title.',
};

export function getFlowConfigBySport(sportSlug: string): SportFlowConfig {
  const s = (sportSlug || '').toLowerCase();

  switch (s) {
    case 'cricket':
      return CRICKET_FLOW;
    case 'football':
      return FOOTBALL_FLOW;
    case 'basketball':
      return BASKETBALL_FLOW;
    case 'tennis':
      return TENNIS_FLOW;
    case 'volleyball':
      return VOLLEYBALL_FLOW;
    case 'kabaddi':
      return KABADDI_FLOW;
    case 'shuttle':
      return SHUTTLE_FLOW;
    default:
      return {
        sportSlug: 'generic',
        name: 'Sport',
        updateScorePrompt: 'Use the form to enter score details.',
        createMatchPrompt: 'Step 1 — Enter Team A name.',
        manageTeamPrompt: 'Step 1 — Enter team name.',
        addHighlightPrompt: 'Step 1 — Enter highlight title.',
      };
  }
}

/**
 * Get sport-specific hints for admin
 */
export function getSportHints(sportSlug: string): string[] {
  const s = (sportSlug || '').toLowerCase();

  const hints: Record<string, string[]> = {
    cricket: [
      'Enter overs in format: 15.2 (15 overs, 2 balls)',
      'Wickets go from 0 to 10',
      'Use quick buttons for live ball-by-ball updates',
      'Extras (wide, no-ball) do not advance the over',
    ],
    football: [
      'Match phases: 1st Half → Half Time → 2nd Half → Full Time',
      'Use quick buttons to increment goals instantly',
      'Event tracking keeps play history',
    ],
    basketball: [
      '4 quarters per match',
      'Quick buttons: +1 (free throw), +2 (regular), +3 (three-pointer)',
      'Total points displayed in real-time',
    ],
    tennis: [
      'Game points: 0, 15, 30, 40, Deuce, Advantage',
      'Set won by first to 6 (with 2-point lead)',
      'Best-of-3 or best-of-5 sets',
      'Enter set scores as: 6-4, 7-5, etc.',
    ],
    volleyball: [
      'Rally scoring to 25 points per set',
      '2 sets to win (best-of-3)',
      'Quick buttons to track points live',
      'Enter set scores like: 25-23, 26-24',
    ],
    kabaddi: [
      'Raids: attacking points',
      'Tackles: defensive points',
      'Total: raid + tackle points',
      'No maximum: keep tracking points',
    ],
    shuttle: [
      'Rally scoring to 21 points per game',
      'Best-of-3 games matches',
      'Enter game scores: 21-19, 21-15, etc.',
    ],
  };

  return hints[s] || ['Use the form to enter sport details.'];
}
