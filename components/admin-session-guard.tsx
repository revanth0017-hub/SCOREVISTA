'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, clearToken, getToken } from '@/lib/api';
import { getJwtRole } from '@/lib/jwt-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type GateState = 'loading' | 'ok' | 'no_token' | 'fan_token' | 'bad_token' | 'server_invalid';

/**
 * Ensures /admin/* is only used with an admin JWT. Fan (user) tokens cause "Admin access required" on APIs.
 */
export function AdminSessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState('no_token');
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
      return;
    }

    const role = getJwtRole(token);
    if (role === 'user') {
      setState('fan_token');
      return;
    }
    if (role !== 'admin') {
      setState('bad_token');
      router.replace(`/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await api.get<{ success: boolean; user?: { role?: string } }>('/api/auth/me');
        if (cancelled) return;
        setState('ok');
      } catch {
        if (cancelled) return;
        setState('server_invalid');
        router.replace(`/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (state === 'loading' || state === 'no_token' || state === 'bad_token' || state === 'server_invalid') {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Checking admin session…</p>
      </div>
    );
  }

  if (state === 'fan_token') {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full border-amber-500/40 bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Wrong login type for admin</CardTitle>
            <CardDescription>
              The token in this browser is for a <strong>regular (fan) account</strong>, not an admin. That is why API
              calls return <strong>“Admin access required”</strong> — the backend correctly rejects non-admin JWTs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Log out of the fan session (button below).</li>
              <li>
                Open <strong>Login</strong> and switch to <strong>Admin Code</strong> (not Regular Login).
              </li>
              <li>Sign in with your <strong>admin email</strong> and <strong>admin code</strong> from signup.</li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  clearToken();
                  router.replace('/login?tab=admin');
                }}
              >
                Clear session &amp; admin login
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/login?tab=admin">Go to login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
