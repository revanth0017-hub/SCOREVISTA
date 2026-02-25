const ADMIN_SPORT_KEY = 'scorevista_admin_sport';

export function getAdminSport(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_SPORT_KEY);
}

export function setAdminSport(sport: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_SPORT_KEY, sport.toLowerCase());
}

export function clearAdminSport(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_SPORT_KEY);
}
