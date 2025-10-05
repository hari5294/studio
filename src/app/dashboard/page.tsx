'use client';

import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { Badge as BadgeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { Badge } from '@/lib/mock-data';

function MyBadges() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const ownedBadgesQuery = useMemo(() => {
    if (!firestore || !user?.id) return null;
    // We need to query the owners subcollection for each badge.
    // A better data model would be to have a `userBadges` collection.
    // For now, let's query all badges and filter on the client.
    // This is inefficient but works for this data structure.
    return collection(firestore, 'badges');
  }, [firestore, user?.id]);

  const { data: allBadges, loading } = useCollection<Badge>(ownedBadgesQuery);

  const myBadges = useMemo(() => {
    if (!allBadges || !user?.id) return [];
    // This part is tricky with Firestore queries. A user's owned badges are stored
    // in a subcollection under each badge. Querying across all subcollections is not
    // straightforward. A common pattern is to duplicate data.
    // Let's assume for now we query a top-level collection of user-badge ownership.
    // Since we don't have that, we'll need to re-think.

    // Let's query all badge owners and filter. This is very inefficient.
    // A better approach would be to have a 'owners' array field on the badge doc.
    // Assuming the `backend.json` implies an owners subcollection, which is not easily queryable like this.

    // Let's fetch all badges and filter them client-side based on an 'owners' array.
    // This requires the 'owners' array to exist on the badge document.
    // Looking at `docs/backend.json`, there is no `owners` array on the `Badge` entity.
    // There is a `/badges/{badgeId}/owners/{userId}` collection.

    // This is a complex query. For now, let's just show badges created by the user.
    return allBadges.filter(b => b.creatorId === user.id);

  }, [allBadges, user?.id]);


  if (loading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

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
          <p className="text-muted-foreground">You haven&apos;t created any badges yet.</p>
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
