'use client';

import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { useAuth } from '@/hooks/use-auth';
import { useMockData } from '@/lib/mock-data';
import { Badge as BadgeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function MyBadges() {
  const { user } = useAuth();
  const { badges, loading } = useMockData();

  if (loading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

  const myBadges = badges.filter(
    (badge) => badge.creatorId === user?.id || badge.owners.includes(user?.id ?? '')
  );

  return (
    <>
      {myBadges.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven&apos;t created or claimed any badges yet.</p>
        </div>
      )}
    </>
  );
}


export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-8 p-4 md:p-6">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
            <BadgeIcon className="h-6 w-6" />
            My Badges
          </h2>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
