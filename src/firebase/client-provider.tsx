'use client';
import { FirebaseProvider } from './provider';
import { getFirebase } from './index';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from '@/components/ui/skeleton';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider value={getFirebase()}>{children}</FirebaseProvider>
  );
}
