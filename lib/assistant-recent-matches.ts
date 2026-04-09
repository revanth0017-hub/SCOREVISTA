const STORAGE_KEY = 'scorevista_assistant_recent_matches_v1';
const MAX = 10;

export type RecentMatchEntry = {
  id: string;
  label: string;
  sportId: string;
  ts: number;
};

function readAll(): RecentMatchEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentMatchEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: RecentMatchEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* ignore quota */
  }
}

export function getRecentMatchesForSport(sportId: string): RecentMatchEntry[] {
  return readAll()
    .filter((e) => e.sportId === sportId)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX);
}

export function rememberAssistantMatch(sportId: string, id: string, label: string) {
  if (!sportId || !id || !label) return;
  const all = readAll().filter((e) => !(e.sportId === sportId && e.id === id));
  all.unshift({ id, label, sportId, ts: Date.now() });
  writeAll(all);
}
