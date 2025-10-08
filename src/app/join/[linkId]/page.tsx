
'use client';

import { useEffect } from 'react';
import { redirect, useParams } from 'next/navigation';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function JoinPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient && linkId) {
      redirect(`/dashboard/redeem?code=${linkId}`);
    }
  }, [isClient, linkId]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
  )
}
