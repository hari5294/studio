'use client';
import { ReactNode } from 'react';

// This component is a placeholder for any app-wide state providers.
// The automatic login logic has been removed to fix the logout loop.
// Authentication is now handled by the useAuth hook and login/signup pages.
export function AppStateProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
