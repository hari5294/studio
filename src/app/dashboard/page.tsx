
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { useUser, useFirestore } from '@/firebase';
import { Badge as BadgeIcon, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, doc, getDoc, collectionGroup } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { Badge } from '@/docs/backend-schema';


function MyBadges() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const [myBadges, setMyBadges] = useState<(Badge & { id: string, owners: any[], followers: any[] })[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMyBadges = async () => {
        setLoadingBadges(true);
        const ownersQuery = query(collectionGroup(firestore, 'owners'), where('userId', '==', user.uid));
        const ownersSnapshot = await getDocs(ownersQuery);
        const badgeIds = ownersSnapshot.docs.map(d => d.data().badgeId);

        if (badgeIds.length > 0) {
            const badgesData = await Promise.all(
                [...new Set(badgeIds)].map(async (badgeId) => {
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
            setMyBadges(badgesData.filter(Boolean) as (Badge & { id: string, owners: any[], followers: any[] })[]);
        } else {
            setMyBadges([]);
        }
        setLoadingBadges(false);
      };
      fetchMyBadges();
    } else if (!authLoading) {
      setMyBadges([]);
      setLoadingBadges(false);
    }
  }, [user, firestore, authLoading]);


  if (authLoading || loadingBadges) {
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

    