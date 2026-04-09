/**
 * Read JWT payload without verifying signature (client-side hint only).
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtRole(token: string | null | undefined): 'admin' | 'user' | null {
  if (!token) return null;
  const p = parseJwtPayload(token);
  const r = p?.role;
  if (r === 'admin') return 'admin';
  if (r === 'user') return 'user';
  return null;
}
