'use client';
import { useAtom } from 'jotai';
import { currentUserIdAtom } from '@/lib/mock-data';
import { ReactNode, useEffect } from 'react';

// This component ensures a default user is "logged in" on initial load
// for the mock data setup. In a real app, this would be handled by a
// session check with a real authentication provider.
export function AppStateProvider({ children }: { children: ReactNode }) {
    const [currentUserId, setCurrentUserId] = useAtom(currentUserIdAtom);

    useEffect(() => {
        // Set a default logged-in user if none is set.
        // This simulates a user session.
        if (currentUserId === null) {
            setCurrentUserId('user1'); // Default to John Doe
        }
    }, [currentUserId, setCurrentUserId]);
    
    return <>{children}</>;
}
