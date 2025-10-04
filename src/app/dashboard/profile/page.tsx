'use client';

import { redirect } from 'next/navigation';
import { useAtom } from 'jotai';
import { currentUserIdAtom } from '@/lib/mock-data';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const [currentUserId] = useAtom(currentUserIdAtom);
    const isClient = useIsClient();

    if (!isClient) {
        return (
             <div className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-48 w-full lg:w-2/3" />
              <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (currentUserId) {
        redirect(`/dashboard/profile/${currentUserId}`);
    }

    // Fallback or loading state if needed, though redirect is fast
    return null;
}
