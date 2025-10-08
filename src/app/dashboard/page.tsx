
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { useUser, useFirestore } from '@/firebase';
import { Badge as BadgeIcon, Gift, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, doc, getDoc, collectionGroup, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { Badge } from '@/docs/backend-schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';


function MyBadges() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const [myBadges, setMyBadges] = useState<(Badge & { id: string, owners: any[], followers: any[] })[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchMyBadges = async () => {
        setLoadingBadges(true);
        setError(null);
        try {
            // Order by claimedAt to get the most recent badges first
            const ownersQuery = query(collectionGroup(firestore, 'owners'), where('userId', '==', user.uid), orderBy('claimedAt', 'desc'));
            const ownersSnapshot = await getDocs(ownersQuery);
            const badgeIds = ownersSnapshot.docs.map(d => d.data().badgeId);

            if (badgeIds.length > 0) {
                const uniqueBadgeIds = [...new Set(badgeIds)];
                const badgesData = await Promise.all(
                    uniqueBadgeIds.map(async (badgeId) => {
                        const badgeRef = doc(firestore, 'badges', badgeId);
                        const badgeSnap = await getDoc(badgeRef);
                        if (!badgeSnap.exists()) return null;
                        const badgeData = { id: badgeSnap.id, ...badgeSnap.data() };

                        const ownersRef = collection(firestore, `badges/${badgeId}/owners`);
                        const followersRef = collection(firestore, `badges/${badgeId}/followers`);

                        const [ownersSnap, followersSnap] = await Promise.all([
                            getDocs(ownersRef),
                            getDocs(followersRef)
                        ]);

                        return {
                            ...badgeData,
                            owners: ownersSnap.docs.map(d => d.data()),
                            followers: followersSnap.docs.map(d => d.data()),
                        } as (Badge & { id: string, owners: any[], followers: any[] });
                    })
                );
                
                // Re-sort based on the original claimedAt order
                const sortedBadges = badgesData.filter(Boolean).sort((a, b) => {
                    return badgeIds.indexOf(a!.id) - badgeIds.indexOf(b!.id);
                }) as (Badge & { id: string, owners: any[], followers: any[] })[];
                
                setMyBadges(sortedBadges);
            } else {
                setMyBadges([]);
            }
        } catch(e: any) {
            console.error(e);
            if (e.code === 'failed-precondition') {
                setError("The database requires a new index for sorting badges. Please create it in your Firebase console. The app may not show badges correctly until then.");
            } else {
                setError("Could not load your badges at this time.");
            }
        } finally {
            setLoadingBadges(false);
        }
      };
      fetchMyBadges();
    } else if (!authLoading) {
      setMyBadges([]);
      setLoadingBadges(false);
    }
  }, [user, firestore, authLoading]);

  const displayedBadges = showAll ? myBadges : myBadges.slice(0, 4);

  if (authLoading || loadingBadges) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          {error} If you have created the index, please try refreshing the page in a few minutes.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {myBadges.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
          {myBadges.length > 4 && (
            <div className="text-center">
              <Button variant="ghost" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : 'Show All'}
                <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", { 'rotate-180': showAll })} />
              </Button>
            </div>
          )}
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
        <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold font-headline">
                <BadgeIcon className="h-6 w-6" />
                My Badges
            </h2>
             <Button asChild variant="outline">
                <Link href="/dashboard/redeem">
                    <Gift className="mr-2 h-4 w-4" /> Redeem Code
                </Link>
            </Button>
        </div>
        <div>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
