
'use client';

import { redirect } from 'next/navigation';

export default function ProfilePage() {
    // For this demo, we'll redirect to the hardcoded user's profile.
    // In a real app, you would get the current user's ID from an auth context.
    redirect('/dashboard/profile/user-1');
}
