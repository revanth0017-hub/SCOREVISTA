/**
 * Cricket Assistant Workflow
 * Pure event-based ball-by-ball scoring with strict innings control
 */

export interface CricketFlowContext {
  step: 'toss' | 'decision' | 'totalOvers' | 'innings-1' | 'innings-2' | 'complete';
  tossWinnerId?: string;
  battingTeamId?: string;
  bowlingTeamId?: string;
  currentInningsNum?: 1 | 2;
  totalOvers?: number;
  ballEvents: any[];
}

export const CRICKET_FLOW_STEPS = {
  toss: {
    title: 'Match Toss',
    description: 'Which team won the toss?',
    prompt: 'Select the team that won the coin toss.',
    action: 'select_toss_winner',
    nextStep: 'decision',
  },
  decision: {
    title: 'Toss Decision',
    description: 'What is the decision?',
    prompt: 'Did the toss winner choose to bat or bowl first?',
    action: 'select_toss_decision',
    options: ['bat', 'bowl'],
    nextStep: 'totalOvers',
  },
  totalOvers: {
    title: 'Match Duration',
    description: 'Enter total overs',
    prompt: 'Enter total overs for this match (e.g., 20 for T20, 50 for ODI, 0 for unlimited)',
    action: 'set_total_overs',
    nextStep: 'innings-1',
  },
  'innings-1': {
    title: 'Innings 1',
    description: 'Ball-by-ball scoring (Real-time event-based)',
    prompt:
      'Ball buttons: 0,1,2,3,4,6,W,WIDE,NB,LB,BYE\nEach click updates instantly. No forms needed.',
    action: 'process_cricket_ball',
    nextStep: 'innings-2',
    isEventBased: true,
    isRealTime: true,
  },
  'innings-2': {
    title: 'Innings 2',
    description: 'Second Innings: Chase Mode',
    prompt:
      'Innings 2 team chases target. Ball buttons work same way. Match ends when target reached or all wickets fall.',
    action: 'process_cricket_ball',
    nextStep: 'complete',
    isEventBased: true,
    isRealTime: true,
  },
  complete: {
    title: 'Match Complete',
    description: 'Final Result',
    prompt: 'Match has been completed. Final scorecard available.',
    action: 'match_complete',
  },
};

export function getCricketFlowConfig(step: string) {
  return CRICKET_FLOW_STEPS[step as keyof typeof CRICKET_FLOW_STEPS] || null;
}

/** Cricket-specific assistant prompts */
export const CRICKET_PROMPTS = {
  selectTossWinner: `
You are assisting with a cricket match. The toss has been completed.

**Toss Winner Selection:**
Ask the user which team won the toss. Display team names and have them select one.

After selection, confirm: "Team [Name] won the toss. Now, what's their decision—BAT or BOWL first?"
  `.trim(),

  selectDecision: `
Toss has been won. Now get the decision.

**Decision:**
- BAT first (our team bats, opponent bowls)
- BOWL first (opponent bats, we bowl)

Confirm the decision.
  `.trim(),

  enterTotalOvers: `
**MATCH SETUP: Total Overs**

Enter the total overs for this match:
- T20: 20 overs
- ODI: 50 overs
- Test: 0 (unlimited)
- Custom: Enter number

This sets the match length. After all overs are played or 10 wickets fall, innings ends.
  `.trim(),

  innings1BallByBall: `
**CRICKET REAL-TIME SCORING - INNINGS 1**

Live ball-by-ball scoring. NO DELAYS, NO FORMS.

⚾ **BALL BUTTONS (click one):**
- Runs: [0] [1] [2] [3] [4] [6]
- Wicket: [W]
- Extras: [WIDE] [NO BALL] [LB] [BYE]

**How it works:**
1. Current score displays: "145/3 (15.2 / 20)"
2. Click a button
3. Score updates INSTANTLY
4. Click "Undo" if wrong
5. Continue until innings ends
6. When first innings finishes, click Start Second Innings to begin the chase.

**Last 6 balls shown:** [1][2][4][4][3][6]

NO review step. NO forms. Pure real-time.
  `.trim(),

  innings2Chase: `
**CRICKET REAL-TIME SCORING - INNINGS 2 (CHASE)**

Innings 2 live scoring. Same buttons, same instant updates.

**Target to chase:** Check the scorecard

**Current score:** Updated in real-time

SAME RULES:
- Click button → instant update
- Undo available
- Match ends when target reached or all out

Keep going!
  `.trim(),
};

export function getCricketAssistantPrompt(step: string, context?: any): string {
  if (step === 'toss') return CRICKET_PROMPTS.selectTossWinner;
  if (step === 'decision') return CRICKET_PROMPTS.selectDecision;
  if (step === 'totalOvers') return CRICKET_PROMPTS.enterTotalOvers;
  if (step === 'innings-1') return CRICKET_PROMPTS.innings1BallByBall;
  if (step === 'innings-2') {
    const target = context?.target || '0';
    const runs = context?.runs || '0';
    const wickets = context?.wickets || '0';
    const overs = context?.overs || '0.0';
    return CRICKET_PROMPTS.innings2Chase
      .replace('${target}', target)
      .replace('${runs}', runs)
      .replace('${wickets}', wickets)
      .replace('${overs}', overs);
  }
  return '';
}
