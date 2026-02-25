/**
 * Generate a unique admin code for sport management
 * Format: SPORT-XXXXXXXXXXXX (e.g., CRICKET-A7K2M9P1Q4X8)
 */
export function generateAdminCode(sport: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const sportPrefix = sport.toUpperCase().substring(0, 6);
  return `${sportPrefix}-${timestamp}${random}`.substring(0, 20);
}

/**
 * Validate if the admin code format is correct
 */
export function isValidAdminCode(code: string): boolean {
  const pattern = /^[A-Z]+-[A-Z0-9]{10,}$/;
  return pattern.test(code);
}

/**
 * Store signup data temporarily with code
 */
export function storeSignupData(email: string, name: string, sport: string, code: string): void {
  const signupData = {
    email,
    name,
    sport,
    code,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  localStorage.setItem(`signup_${code}`, JSON.stringify(signupData));
}

/**
 * Retrieve signup data by code
 */
export function getSignupData(code: string): {
  email: string;
  name: string;
  sport: string;
  code: string;
  timestamp: number;
  expiresAt: number;
} | null {
  const data = localStorage.getItem(`signup_${code}`);
  if (!data) return null;

  const parsed = JSON.parse(data);
  if (Date.now() > parsed.expiresAt) {
    localStorage.removeItem(`signup_${code}`);
    return null;
  }

  return parsed;
}

/**
 * Clear signup data
 */
export function clearSignupData(code: string): void {
  localStorage.removeItem(`signup_${code}`);
}
