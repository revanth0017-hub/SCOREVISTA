/**
 * Shuttle/Badminton Assistant Workflow
 * Set-wise (Set A, B, C) with point-by-point tracking within each set
 * Rally scoring to 21 points per set
 */

export interface ShuttleFlowContext {
  step: 'set_selection' | 'set_a' | 'set_b' | 'set_c' | 'complete';
  currentSet?: 'A' | 'B' | 'C';
  setAScore?: { playerA: number; playerB: number };
  setBScore?: { playerA: number; playerB: number };
  setCScore?: { playerA: number; playerB: number };
  pointEvents: any[];
}

export const SHUTTLE_FLOW_STEPS = {
  set_selection: {
    title: 'Select Set',
    description: 'Which set are you scoring?',
    prompt: 'Select the set you want to score: [Set A] [Set B] [Set C]',
    action: 'select_shuttle_set',
    nextStep: 'set_a', // Will be dynamic based on selection
    options: ['A', 'B', 'C'],
  },
  set_a: {
    title: 'Set A',
    description: 'Point-by-point scoring (Rally to 21)',
    prompt:
      'Point buttons: [+A] [+B]\nEach click updates instantly. Rally to 21 points to win this set.\nWhen Set A finishes, select Set B to continue.',
    action: 'process_shuttle_point',
    nextStep: 'set_b',
    isEventBased: true,
    isRealTime: true,
  },
  set_b: {
    title: 'Set B',
    description: 'Point-by-point scoring (Rally to 21)',
    prompt:
      'Set B scoring. Point buttons: [+A] [+B]\nRally to 21 points. When done, select Set C or finish.',
    action: 'process_shuttle_point',
    nextStep: 'set_c',
    isEventBased: true,
    isRealTime: true,
  },
  set_c: {
    title: 'Set C',
    description: 'Tiebreaker Set (if needed)',
    prompt:
      'Set C (Tiebreaker if needed). Point buttons: [+A] [+B]\nRally to 21 points. When finished, match is complete.',
    action: 'process_shuttle_point',
    nextStep: 'complete',
    isEventBased: true,
    isRealTime: true,
  },
  complete: {
    title: 'Match Complete',
    description: 'Final Result',
    prompt: 'Match completed. Final scorecard available.',
    action: 'match_complete',
  },
};

export function getShuttleFlowConfig(step: string) {
  return SHUTTLE_FLOW_STEPS[step as keyof typeof SHUTTLE_FLOW_STEPS] || null;
}

/** Shuttle-specific assistant prompts */
export const SHUTTLE_PROMPTS = {
  selectSet: `
You are assisting with a badminton/shuttle match. Let's set up point-by-point scoring.

**Set Selection:**
Which set would you like to score?
- [Set A] - First set (to 21)
- [Set B] - Second set (to 21)
- [Set C] - Tiebreaker (to 21, if needed)

Select one to begin real-time point tracking.
  `.trim(),

  setAPointByPoint: `
**SHUTTLE REAL-TIME SCORING - SET A**

Live point-by-point scoring. Rally to 21 points to win the set.

🏸 **POINT BUTTONS (click one):**
- Player A: [+A]
- Player B: [+B]

**How it works:**
1. Current score displays: "A: 12 | B: 10"
2. Click a button
3. Score updates INSTANTLY
4. Click "Undo" if wrong
5. Continue until one player reaches 21
6. When Set A finishes, click "Next Set B" to continue

**Last 6 points shown:** [A][B][A][A][B][A]

NO review step. Pure real-time point tracking.
  `.trim(),

  setBPointByPoint: `
**SHUTTLE REAL-TIME SCORING - SET B**

Set B live scoring. Same buttons, same instant updates.

**Current score:** 
- Set A: Check completed score
- Set B: Updated in real-time

SAME RULES:
- Click button → instant update
- Rally to 21 points
- Undo available
- When Set B finishes, click "Next Set C" or "Complete Match"

Keep going!
  `.trim(),

  setCPointByPoint: `
**SHUTTLE REAL-TIME SCORING - SET C (TIEBREAKER)**

Final set if needed. Same instant point tracking.

**Current score:**
- Set A: Completed
- Set B: Completed
- Set C: Live (rally to 21)

SAME RULES:
- Click button → instant update
- Rally to 21 points
- Undo available
- When finished, match is complete

Final set — finish strong!
  `.trim(),
};

export function getShuttleAssistantPrompt(step: string, context?: any): string {
  if (step === 'set_selection') return SHUTTLE_PROMPTS.selectSet;
  if (step === 'set_a') return SHUTTLE_PROMPTS.setAPointByPoint;
  if (step === 'set_b') return SHUTTLE_PROMPTS.setBPointByPoint;
  if (step === 'set_c') return SHUTTLE_PROMPTS.setCPointByPoint;
  return 'Continue with the next step.';
}
