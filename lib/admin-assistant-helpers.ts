/** Pure helpers for rule-based admin assistant flows (no API calls). */

export function parseVsInput(input: string): [string, string] | null {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  let parts: string[];
  if (/\bvs\.?\b/i.test(normalized)) {
    parts = normalized.split(/\bvs\.?\b/i);
  } else if (/\s+v\s+/i.test(normalized)) {
    parts = normalized.split(/\s+v\s+/i);
  } else {
    return null;
  }
  if (parts.length !== 2) return null;
  const a = parts[0].replace(/[-–—]/g, ' ').trim();
  const b = parts[1].replace(/[-–—]/g, ' ').trim();
  if (!a || !b) return null;
  return [a, b];
}

export type TeamNameMatch = { _id: string; name: string };

export type MatchListItem = {
  _id: string;
  teamA?: TeamNameMatch;
  teamB?: TeamNameMatch;
};

export function findMatchByTeamNames(
  matches: MatchListItem[],
  rawA: string,
  rawB: string
): MatchListItem | undefined {
  const na = rawA.toLowerCase();
  const nb = rawB.toLowerCase();
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

  return matches.find((m) => {
    const a = norm(m.teamA?.name ?? '');
    const b = norm(m.teamB?.name ?? '');
    if (!a || !b) return false;
    const hit =
      (a.includes(na) && b.includes(nb)) ||
      (a.includes(nb) && b.includes(na)) ||
      (na.includes(a) && nb.includes(b)) ||
      (na.includes(b) && nb.includes(a));
    return hit || (a === na && b === nb) || (a === nb && b === na);
  });
}

export function findTeamByName(
  teams: TeamNameMatch[],
  name: string
): TeamNameMatch | undefined {
  const n = name.toLowerCase().trim();
  if (!n) return undefined;
  return teams.find((t) => t.name.toLowerCase().trim() === n || t.name.toLowerCase().includes(n) || n.includes(t.name.toLowerCase()));
}

export function parseLiveFinishedStatus(input: string): 'live' | 'completed' | null {
  const t = input.toLowerCase().trim();
  if (!t) return null;
  if (t === 'live' || t.includes('live')) return 'live';
  if (t === 'finished' || t.includes('finish') || t === 'completed' || t.includes('complete')) {
    return 'completed';
  }
  return null;
}

export function parseScore(input: string): number | null {
  const n = Number(String(input).trim());
  if (Number.isNaN(n) || n < 0) return null;
  return Math.floor(n);
}

export function isAffirmative(input: string): boolean {
  const t = input.toLowerCase().trim();
  return t === 'y' || t === 'yes' || t === 'confirm' || t === 'ok' || t === 'sure';
}

export function isNegative(input: string): boolean {
  const t = input.toLowerCase().trim();
  return t === 'n' || t === 'no' || t === 'cancel';
}
