'use client';

import { ReactNode } from 'react';

// This component is a placeholder for any app-wide state providers.
// Authentication is handled by the useAuth hook and login/signup pages.
export function AppStateProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
