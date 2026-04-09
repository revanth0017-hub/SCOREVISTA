/**
 * Hide raw browser network errors ("Failed to fetch") from user-facing UI.
 */

const NETWORK_HINT =
  /failed to fetch|failed to load|networkerror|network request failed|load failed|fetch failed|connection refused|net::err_|ecconnrefused|load failed/i;

export function isLikelyNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = (err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  if (name === 'typeerror' && (msg.includes('fetch') || msg.includes('failed'))) return true;
  return NETWORK_HINT.test(err.message || '');
}

/** Use for read-only / marketing UI: show nothing when offline or unreachable. */
export function messageIfWorthShowing(err: unknown): string | null {
  if (isLikelyNetworkFailure(err)) return null;
  if (err instanceof Error && err.message.trim()) return err.message;
  return null;
}

/** Use for forms: never surface "Failed to fetch"; use a generic line instead. */
export function safeActionError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isLikelyNetworkFailure(err)) return fallback;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}
