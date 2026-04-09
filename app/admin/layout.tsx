'use client';

import { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSessionGuard } from '@/components/admin-session-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AdminSessionGuard>{children}</AdminSessionGuard>
      </Suspense>
    </SidebarProvider>
  );
}
