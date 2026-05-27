'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { CurrencyProvider } from '@/lib/context/CurrencyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </ThemeProvider>
  );
}
