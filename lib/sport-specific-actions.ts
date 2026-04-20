/**
 * CRICKET ONLY: Event-based ball-by-ball scoring system
 * All score calculated from events. NO manual entry allowed.
 */

export type CricketBallEvent = 
  | 'runs-0' | 'runs-1' | 'runs-2' | 'runs-3' | 'runs-4' | 'runs-6'
  | 'wicket'
  | 'wide' | 'noBall' | 'legBye' | 'bye';

export interface CricketBall {
  ballId: number; // Sequential ball number
  event: CricketBallEvent;
  runsScored: number;
  isWicket: boolean;
  isExtra: boolean; // wide, noBall, legBye, bye
  timestamp: string;
}

export interface CricketInnings {
  inningsNum: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  balls: CricketBall[];
  status: 'not-started' | 'live' | 'completed';
  target?: number; // For innings 2
}

export interface CricketMatchState {
  tossWinnerId?: string;
  tossDecision?: 'bat' | 'bowl';
  innings: CricketInnings[];
  currentInningsNum: 1 | 2;
}

/** Process a single ball event */
export function processCricketBallEvent(
  event: CricketBallEvent,
  currentInnings: CricketInnings
): {
  runs: number;
  wickets: number;
  balls: number;
  overs: string;
  ballNumber: number;
} {
  const balls = currentInnings.balls || [];
  const ballNumber = balls.length + 1;
  let ballCount = 0;
  let totalRuns = 0;
  let totalWickets = 0;

  const resolveBallRuns = (ball: CricketBall): number => {
    if (typeof ball.runsScored === 'number' && !Number.isNaN(ball.runsScored)) {
      return ball.runsScored;
    }
    switch (ball.event) {
      case 'runs-0': return 0;
      case 'runs-1': return 1;
      case 'runs-2': return 2;
      case 'runs-3': return 3;
      case 'runs-4': return 4;
      case 'runs-6': return 6;
      case 'wide':
      case 'noBall':
      case 'legBye':
      case 'bye':
        return 1;
      default:
        return 0;
    }
  };

  const resolveBallExtra = (ball: CricketBall): boolean => {
    if (typeof ball.isExtra === 'boolean') return ball.isExtra;
    return ['wide', 'noBall', 'legBye', 'bye'].includes(ball.event);
  };

  const resolveBallWicket = (ball: CricketBall): boolean => {
    if (typeof ball.isWicket === 'boolean') return ball.isWicket;
    return ball.event === 'wicket';
  };

  // Count only legal balls for overs calculation
  for (const ball of balls) {
    const isExtraBall = resolveBallExtra(ball);
    if (!isExtraBall) {
      ballCount += 1;
    }
    totalRuns += resolveBallRuns(ball);
    if (resolveBallWicket(ball)) totalWickets += 1;
  }

  // Process new event
  let runsFromBall = 0;
  let isExtra = false;
  let isWicket = false;

  if (event === 'runs-0') runsFromBall = 0;
  else if (event === 'runs-1') runsFromBall = 1;
  else if (event === 'runs-2') runsFromBall = 2;
  else if (event === 'runs-3') runsFromBall = 3;
  else if (event === 'runs-4') runsFromBall = 4;
  else if (event === 'runs-6') runsFromBall = 6;
  else if (event === 'wicket') {
    isWicket = true;
    runsFromBall = 0;
  } else if (event === 'wide') {
    isExtra = true;
    runsFromBall = 1; // Wide = 1 run
  } else if (event === 'noBall') {
    isExtra = true;
    runsFromBall = 1; // No ball = 1 run
  } else if (event === 'legBye') {
    isExtra = true;
    runsFromBall = 1; // LegBye = 1 run
  } else if (event === 'bye') {
    isExtra = true;
    runsFromBall = 1; // Bye = 1 run
  }

  totalRuns += runsFromBall;
  if (isWicket && totalWickets < 10) totalWickets += 1;

  // Only advance ball count if it's NOT an extra
  if (!isExtra) {
    ballCount += 1;
  }

  // Calculate overs: overs.balls format (e.g. "5.3" = 5 overs, 3 balls)
  const oversNum = Math.floor(ballCount / 6);
  const ballsInCurrentOver = ballCount % 6;
  const oversStr = `${oversNum}.${ballsInCurrentOver}`;

  return {
    runs: totalRuns,
    wickets: totalWickets,
    balls: ballCount,
    overs: oversStr,
    ballNumber,
  };
}

/** Get display format for cricket score */
export function formatCricketScoreDisplay(
  runs: number,
  wickets: number,
  overs: string
): string {
  return `${runs}/${wickets} (${overs})`;
}

/** Get cricket quick action buttons (NO manual inputs) */
export const CRICKET_BALL_BUTTONS = [
  { id: 'runs-0', label: '0', icon: '·' },
  { id: 'runs-1', label: '1', icon: '●' },
  { id: 'runs-2', label: '2', icon: '●●' },
  { id: 'runs-3', label: '3', icon: '■' },
  { id: 'runs-4', label: '4', icon: '◆' },
  { id: 'runs-6', label: '6', icon: '◇' },
  { id: 'wicket', label: 'W', icon: '✕' },
  { id: 'wide', label: 'Wd', icon: '⊕' },
  { id: 'noBall', label: 'Nb', icon: '◎' },
  { id: 'legBye', label: 'LB', icon: '⊙' },
  { id: 'bye', label: 'B', icon: '○' },
];

/** OTHER SPORTS QUICK ACTIONS (unchanged) */

export interface QuickAction {
  id: string;
  label: string;
  key?: string;
  icon?: string;
  color?: string;
}

export const FOOTBALL_ACTIONS: QuickAction[] = [
  { id: 'goal-a', label: '⚽ Goal A', icon: '➕' },
  { id: 'goal-b', label: '⚽ Goal B', icon: '➕' },
  { id: 'phase-1h', label: '1️⃣ 1st Half' },
  { id: 'phase-ht', label: '⏸️ Half Time' },
  { id: 'phase-2h', label: '2️⃣ 2nd Half' },
  { id: 'phase-ft', label: '🏁 Full Time' },
];

export const BASKETBALL_ACTIONS: QuickAction[] = [
  { id: 'point-1', label: '+1 Point', icon: '1️⃣' },
  { id: 'point-2', label: '+2 Points', icon: '2️⃣' },
  { id: 'point-3', label: '+3 Points', icon: '3️⃣' },
  { id: 'quarter-1', label: 'Q1' },
  { id: 'quarter-2', label: 'Q2' },
  { id: 'quarter-3', label: 'Q3' },
  { id: 'quarter-4', label: 'Q4' },
];

export const TENNIS_ACTIONS: QuickAction[] = [
  { id: 'next-set', label: 'Next Set', icon: '🎾' },
  { id: 'game-0', label: '0' },
  { id: 'game-15', label: '15' },
  { id: 'game-30', label: '30' },
  { id: 'game-40', label: '40' },
  { id: 'deuce', label: 'Deuce', icon: '⚖️' },
  { id: 'ad-a', label: 'Ad-A', icon: '→' },
  { id: 'ad-b', label: 'Ad-B', icon: '←' },
];

export const VOLLEYBALL_ACTIONS: QuickAction[] = [
  { id: 'point-a', label: '➕ Point A', icon: '🏐' },
  { id: 'point-b', label: '➕ Point B', icon: '🏐' },
  { id: 'next-set', label: 'Next Set', icon: 'Ⓢ' },
  { id: 'set-win-a', label: 'Set Win A', color: 'emerald' },
  { id: 'set-win-b', label: 'Set Win B', color: 'emerald' },
];

export const KABADDI_ACTIONS: QuickAction[] = [
  { id: 'raid-a', label: '🏃 Raid A', icon: '➕' },
  { id: 'tackle-a', label: '🤝 Tackle A', icon: '➕' },
  { id: 'raid-b', label: '🏃 Raid B', icon: '➕' },
  { id: 'tackle-b', label: '🤝 Tackle B', icon: '➕' },
];

export const SHUTTLE_ACTIONS: QuickAction[] = [
  { id: 'point-a', label: '➕ Point A', icon: '🏸' },
  { id: 'point-b', label: '➕ Point B', icon: '🏸' },
  { id: 'next-set', label: 'Next Set', icon: 'Ⓢ' },
];

export function getQuickActionsBySport(sportSlug: string): QuickAction[] {
  const s = (sportSlug || '').toLowerCase();

  switch (s) {
    case 'cricket':
      return CRICKET_BALL_BUTTONS as unknown as QuickAction[];
    case 'football':
      return FOOTBALL_ACTIONS;
    case 'basketball':
      return BASKETBALL_ACTIONS;
    case 'tennis':
      return TENNIS_ACTIONS;
    case 'volleyball':
      return VOLLEYBALL_ACTIONS;
    case 'kabaddi':
      return KABADDI_ACTIONS;
    case 'shuttle':
      return SHUTTLE_ACTIONS;
    default:
      return [];
  }
}
