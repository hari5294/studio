
'use client';

import { redirect } from 'next/navigation';
import { useUser } from '@/firebase';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, loading } = useUser();
    const isClient = useIsClient();

    if (loading || !isClient) {
        return (
             <div className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-48 w-full lg:w-2/3" />
              <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (user) {
        redirect(`/dashboard/profile/${user.uid}`);
    } else {
        redirect('/login');
    }

    return null;
}
