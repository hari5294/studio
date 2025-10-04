'use client';

import { Header } from '@/components/layout/header';
import { getUserById, type Badge as BadgeType, type User } from '@/lib/data';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { Badge } from 'lucide-react';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function MyBadges() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const badgesQuery = user
    ? query(collection(firestore, 'badges'), where('owners', 'array-contains', user.uid))
    : null;

  const { data: myBadges, loading: badgesLoading } = useCollection<BadgeType>(badgesQuery);

  if (userLoading || badgesLoading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

  return (
    <>
      {myBadges && myBadges.length > 0 ? (
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
            <Badge className="h-6 w-6" />
            My Badges
          </h2>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
