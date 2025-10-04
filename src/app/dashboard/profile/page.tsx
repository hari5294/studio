
'use client';

import { redirect } from 'next/navigation';
import { useUser } from '@/firebase';

export default function ProfilePage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    if (user) {
        redirect(`/dashboard/profile/${user.uid}`);
    } else {
        // Not authenticated, redirect to login
        redirect('/login');
    }
}
