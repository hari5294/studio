
'use client';

import { redirect } from 'next/navigation';

export default function ProfilePage() {
    const mockUser = { uid: '123' }; // Mock user
    if (mockUser) {
        redirect(`/dashboard/profile/${mockUser.uid}`);
    } else {
        // Not authenticated, redirect to login
        redirect('/login');
    }
}
