'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { SportThemeWrapper } from '@/components/sport-theme-wrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <SportThemeWrapper>{children}</SportThemeWrapper>
    </ThemeProvider>
  );
}
