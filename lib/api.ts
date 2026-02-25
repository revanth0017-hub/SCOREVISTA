/**
 * API client for ScoreVista backend.
 * Uses NEXT_PUBLIC_API_URL (e.g. http://localhost:5000) and stored JWT for auth.
 */

const TOKEN_KEY = 'scorevista_token';
const USER_KEY = 'scorevista_user';

export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  return url.replace(/\/$/, '');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data as T;
}


export const api = {
  async get<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...options?.headers },
    });
    return handleResponse<T>(res);
  },

  async postJson<T = unknown>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${getApiUrl()}${path}`, {
      method: 'POST',
      ...options,
      headers: { ...authHeaders(), ...options?.headers },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  /** POST multipart/form-data (e.g. file upload). Do not set Content-Type. */
  async postFormData<T = unknown>(path: string, formData: FormData, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${getApiUrl()}${path}`, {
      method: 'POST',
      ...options,
      headers: { ...headers, ...options?.headers },
      body: formData,
    });
    return handleResponse<T>(res);
  },

  async patch<T = unknown>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${getApiUrl()}${path}`, {
      method: 'PATCH',
      ...options,
      headers: { ...authHeaders(), ...options?.headers },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async delete<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${getApiUrl()}${path}`, {
      method: 'DELETE',
      ...options,
      headers: { ...authHeaders(), ...options?.headers },
    });
    return handleResponse<T>(res);
  },
};
