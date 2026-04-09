/**
 * Sport-specific score definitions for the admin assistant and previews.
 * Aligned with backend Match.sportScore (Mixed) and legacy scoreA/scoreB.
 */

export type SportSlug =
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'volleyball'
  | 'kabaddi'
  | 'shuttle'
  | string;

export type ScoreFieldType = 'number' | 'text' | 'setPairs';

export interface ScoreFieldDef {
  id: string;
  label: string;
  type: ScoreFieldType;
  placeholder?: string;
  /** For setPairs: number of set rows to show (badminton/volleyball/tennis use same UI). */
  setRows?: number;
}

export interface SportScoreFormConfig {
  sportSlug: SportSlug;
  label: string;
  fields: ScoreFieldDef[];
  /** How many "set score" rows (A-B) to show for set-based sports. */
  defaultSetRows?: number;
}

const SET_BASED_DEFAULT_ROWS = 3;

export function getScoreConfigBySport(sportSlug: string): SportScoreFormConfig {
  const s = (sportSlug || '').toLowerCase();

  if (s === 'cricket') {
    return {
      sportSlug: 'cricket',
      label: 'Cricket (runs / wickets / overs)',
      fields: [
        { id: 'runsA', label: 'Team A — Runs', type: 'number' },
        { id: 'wicketsA', label: 'Team A — Wickets', type: 'number' },
        { id: 'oversA', label: 'Team A — Overs (e.g. 15.2)', type: 'text', placeholder: '15.2' },
        { id: 'runsB', label: 'Team B — Runs', type: 'number' },
        { id: 'wicketsB', label: 'Team B — Wickets', type: 'number' },
        { id: 'oversB', label: 'Team B — Overs', type: 'text', placeholder: '20.0' },
      ],
    };
  }

  if (s === 'football') {
    return {
      sportSlug: 'football',
      label: 'Football (goals)',
      fields: [
        { id: 'goalsA', label: 'Team A — Goals', type: 'number' },
        { id: 'goalsB', label: 'Team B — Goals', type: 'number' },
      ],
    };
  }

  if (s === 'basketball') {
    return {
      sportSlug: 'basketball',
      label: 'Basketball (points)',
      fields: [
        { id: 'pointsA', label: 'Team A — Points', type: 'number' },
        { id: 'pointsB', label: 'Team B — Points', type: 'number' },
      ],
    };
  }

  if (s === 'kabaddi') {
    return {
      sportSlug: 'kabaddi',
      label: 'Kabaddi (raid / tackle / total)',
      fields: [
        { id: 'raidA', label: 'Team A — Raid points', type: 'number' },
        { id: 'tackleA', label: 'Team A — Tackle points', type: 'number' },
        { id: 'totalA', label: 'Team A — Total points', type: 'number' },
        { id: 'raidB', label: 'Team B — Raid points', type: 'number' },
        { id: 'tackleB', label: 'Team B — Tackle points', type: 'number' },
        { id: 'totalB', label: 'Team B — Total points', type: 'number' },
      ],
    };
  }

  if (s === 'tennis') {
    return {
      sportSlug: 'tennis',
      label: 'Tennis (set scores, e.g. 6-4)',
      fields: [{ id: 'setPairs', label: 'Set scores (Team A — Team B)', type: 'setPairs' }],
      defaultSetRows: 5,
    };
  }

  if (s === 'volleyball') {
    return {
      sportSlug: 'volleyball',
      label: 'Volleyball (per-set scores)',
      fields: [{ id: 'setPairs', label: 'Set scores (Team A — Team B)', type: 'setPairs' }],
      defaultSetRows: SET_BASED_DEFAULT_ROWS,
    };
  }

  if (s === 'shuttle') {
    return {
      sportSlug: 'shuttle',
      label: 'Badminton / Shuttle (per-set to 21)',
      fields: [{ id: 'setPairs', label: 'Set scores (Team A — Team B)', type: 'setPairs' }],
      defaultSetRows: SET_BASED_DEFAULT_ROWS,
    };
  }

  return {
    sportSlug: s || 'generic',
    label: 'Score (numeric)',
    fields: [
      { id: 'scoreA', label: 'Team A — Score', type: 'number' },
      { id: 'scoreB', label: 'Team B — Score', type: 'number' },
    ],
  };
}

/** Parse "6-4" or "6 - 4" into { a, b } */
export function parseSetPair(raw: string): { a: number; b: number } | null {
  const t = raw.trim();
  const m = t.match(/^(\d+)\s*[-–:]\s*(\d+)$/);
  if (!m) return null;
  return { a: Number(m[1]), b: Number(m[2]) };
}

export type SportScoreDraft = Record<string, string | number | undefined> & {
  setPairs?: string[];
  status?: 'live' | 'completed';
};

export function validateSportScoreDraft(sportSlug: string, draft: SportScoreDraft): string | null {
  const s = (sportSlug || '').toLowerCase();
  const num = (v: unknown) => (v === '' || v === undefined ? NaN : Number(v));

  if (s === 'cricket') {
    for (const k of ['runsA', 'runsB', 'wicketsA', 'wicketsB'] as const) {
      const n = num(draft[k]);
      if (Number.isNaN(n) || n < 0) return `${k} must be a non-negative number`;
    }
    if (!String(draft.oversA || '').trim() || !String(draft.oversB || '').trim()) {
      return 'Overs are required for both teams (e.g. 15.2)';
    }
    return null;
  }

  if (s === 'football' || s === 'basketball') {
    const a = num(draft.goalsA ?? draft.pointsA ?? draft.scoreA);
    const b = num(draft.goalsB ?? draft.pointsB ?? draft.scoreB);
    if (Number.isNaN(a) || a < 0 || Number.isNaN(b) || b < 0) return 'Enter valid non-negative scores for both teams';
    return null;
  }

  if (s === 'kabaddi') {
    for (const k of ['raidA', 'tackleA', 'totalA', 'raidB', 'tackleB', 'totalB'] as const) {
      const n = num(draft[k]);
      if (Number.isNaN(n) || n < 0) return `${k} must be a non-negative number`;
    }
    return null;
  }

  if (s === 'tennis' || s === 'volleyball' || s === 'shuttle') {
    const pairs = draft.setPairs || [];
    const valid = pairs.map((p) => parseSetPair(p)).filter(Boolean) as { a: number; b: number }[];
    if (valid.length === 0) return 'Enter at least one set score like 6-4 or 21-19';
    return null;
  }

  const a = num(draft.scoreA);
  const b = num(draft.scoreB);
  if (Number.isNaN(a) || a < 0 || Number.isNaN(b) || b < 0) return 'Enter valid scores for both teams';
  return null;
}

export function formatScorePreview(
  sportSlug: string,
  teamA: string,
  teamB: string,
  draft: SportScoreDraft
): string {
  const s = (sportSlug || '').toLowerCase();
  const lines: string[] = [];

  if (s === 'cricket') {
    lines.push(
      `${teamA} ${draft.runsA}/${draft.wicketsA} (${draft.oversA} overs)`,
      `${teamB} ${draft.runsB}/${draft.wicketsB} (${draft.oversB} overs)`
    );
  } else if (s === 'football') {
    lines.push(`${teamA} ${draft.goalsA} - ${draft.goalsB} ${teamB}`);
  } else if (s === 'basketball') {
    lines.push(`${teamA} ${draft.pointsA} - ${draft.pointsB} ${teamB}`);
  } else if (s === 'kabaddi') {
    lines.push(
      `${teamA} — raid ${draft.raidA}, tackle ${draft.tackleA}, total ${draft.totalA}`,
      `${teamB} — raid ${draft.raidB}, tackle ${draft.tackleB}, total ${draft.totalB}`
    );
  } else if (s === 'tennis' || s === 'volleyball' || s === 'shuttle') {
    const pairs = (draft.setPairs || []).map((p) => parseSetPair(p)).filter(Boolean) as { a: number; b: number }[];
    const fmt = pairs.map((x) => `${x.a}-${x.b}`).join(', ');
    let wA = 0;
    let wB = 0;
    pairs.forEach((x) => {
      if (x.a > x.b) wA++;
      else if (x.b > x.a) wB++;
    });
    lines.push(`${teamA} vs ${teamB}`, fmt, `Sets won: ${teamA} ${wA} — ${wB} ${teamB}`);
  } else {
    lines.push(`${teamA} ${draft.scoreA} - ${draft.scoreB} ${teamB}`);
  }

  if (draft.status) {
    lines.push(`Status: ${draft.status === 'live' ? 'Live' : 'Finished'}`);
  }
  return lines.join('\n');
}

/** Build API body for PUT /api/matches/:id/score */
export function buildScoreUpdatePayload(sportSlug: string, draft: SportScoreDraft): Record<string, unknown> {
  const s = (sportSlug || '').toLowerCase();
  const status = draft.status || 'live';

  if (s === 'cricket') {
    const runsA = Number(draft.runsA);
    const runsB = Number(draft.runsB);
    return {
      scoreA: runsA,
      scoreB: runsB,
      oversA: String(draft.oversA || '').trim(),
      oversB: String(draft.oversB || '').trim(),
      status,
      sportScore: {
        sportSlug: 'cricket',
        teamA: { runs: runsA, wickets: Number(draft.wicketsA), overs: String(draft.oversA || '').trim() },
        teamB: { runs: runsB, wickets: Number(draft.wicketsB), overs: String(draft.oversB || '').trim() },
      },
    };
  }

  if (s === 'football') {
    const a = Number(draft.goalsA);
    const b = Number(draft.goalsB);
    return {
      scoreA: a,
      scoreB: b,
      status,
      sportScore: { sportSlug: 'football', teamA: { goals: a }, teamB: { goals: b } },
    };
  }

  if (s === 'basketball') {
    const a = Number(draft.pointsA);
    const b = Number(draft.pointsB);
    return {
      scoreA: a,
      scoreB: b,
      status,
      sportScore: { sportSlug: 'basketball', teamA: { points: a }, teamB: { points: b } },
    };
  }

  if (s === 'kabaddi') {
    const a = Number(draft.totalA);
    const b = Number(draft.totalB);
    return {
      scoreA: a,
      scoreB: b,
      status,
      sportScore: {
        sportSlug: 'kabaddi',
        teamA: {
          raid: Number(draft.raidA),
          tackle: Number(draft.tackleA),
          total: a,
        },
        teamB: {
          raid: Number(draft.raidB),
          tackle: Number(draft.tackleB),
          total: b,
        },
      },
    };
  }

  if (s === 'tennis' || s === 'volleyball' || s === 'shuttle') {
    const pairs = (draft.setPairs || [])
      .map((p) => parseSetPair(p))
      .filter((x): x is { a: number; b: number } => x !== null);
    let wA = 0;
    let wB = 0;
    pairs.forEach((x) => {
      if (x.a > x.b) wA++;
      else if (x.b > x.a) wB++;
    });
    return {
      scoreA: wA,
      scoreB: wB,
      status,
      sportScore: {
        sportSlug: s,
        sets: pairs,
      },
    };
  }

  const a = Number(draft.scoreA);
  const b = Number(draft.scoreB);
  return {
    scoreA: a,
    scoreB: b,
    status,
    sportScore: { sportSlug: s || 'generic', teamA: { value: a }, teamB: { value: b } },
  };
}
