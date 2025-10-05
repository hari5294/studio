
'use client';

import { ReactNode } from 'react';
import { MockDataProvider } from '@/lib/mock-data';

// This component is a placeholder for any app-wide state providers.
// Authentication is handled by the useAuth hook and login/signup pages.
export function AppStateProvider({ children }: { children: ReactNode }) {
    return <MockDataProvider>{children}</MockDataProvider>;
}
