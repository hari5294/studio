
'use client';

import { redirect } from 'next/navigation';

export default function ProfilePage() {
    const mockUser = { uid: '123' }; // Mock user
    // Always redirect to the main user's profile in this prototype
    redirect(`/dashboard/profile/${mockUser.uid}`);
}
