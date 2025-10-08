
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useEffect, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

function TrendingBadgeItem({ badge, index }: { badge: any, index: number }) {
    const badgesLeft = badge.tokens - (badge.owners?.length || 0);

    return (
        <Link href={`/dashboard/badge/${badge.id}?burst=true`} className="block">
            <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-lg font-bold text-muted-foreground">
                <Flame className="h-5 w-5 text-accent" />
                <span>#{index + 1}</span>
            </div>
            <div className="text-3xl">{badge.emojis}</div>
            <div className="flex-grow">
                <p className="font-semibold">{badge.name}</p>
                {badge.creator && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                            {badge.creator.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-sm">{badge.creator.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{badge.creator.name?.charAt(0) ?? '?'}</AvatarFallback>
                            )}
                        </Avatar>
                        <span>{badge.creator.name}</span>
                    </div>
                )}
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 font-semibold text-lg">
                    <Users className="h-5 w-5" />
                    <span>{(badge.followers?.length || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{badgesLeft.toLocaleString()} / {badge.tokens.toLocaleString()} left</p>
            </div>
            </div>
        </Link>
    )
}


export function TrendingBadges() {
    const firestore = useFirestore();
    const [trendingBadges, setTrendingBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingBadges = async () => {
            setLoading(true);
            const badgesRef = collection(firestore, 'badges');
            const badgesSnap = await getDocs(badgesRef);
            
            const badgesWithDetails = await Promise.all(
                badgesSnap.docs.map(async (badgeDoc) => {
                    const badgeData = { id: badgeDoc.id, ...badgeDoc.data() };

                    const followersRef = collection(firestore, `badges/${badgeDoc.id}/followers`);
                    const ownersRef = collection(firestore, `badges/${badgeDoc.id}/owners`);
                    const creatorRef = doc(firestore, 'users', badgeData.creatorId);

                    const [followersSnap, ownersSnap, creatorSnap] = await Promise.all([
                        getDocs(followersRef),
                        getDocs(ownersRef),
                        getDoc(creatorRef)
                    ]);

                    return {
                        ...badgeData,
                        followers: followersSnap.docs.map(d => d.data()),
                        owners: ownersSnap.docs.map(d => d.data()),
                        creator: creatorSnap.exists() ? creatorSnap.data() : null,
                    };
                })
            );

            const sortedBadges = badgesWithDetails
                .sort((a,b) => (b.followers?.length || 0) - (a.followers?.length || 0))
                .slice(0, 5);

            setTrendingBadges(sortedBadges);
            setLoading(false);
        };

        fetchTrendingBadges();
    }, [firestore]);


  if (loading) {
    return (
         <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <TrendingUp className="h-6 w-6" />
                Trending Badges
            </h2>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
        <TrendingUp className="h-6 w-6" />
        Trending Badges
      </h2>
      <div className="space-y-4">
        {trendingBadges.map((badge, index) => {
            return (
                <TrendingBadgeItem key={badge.id} badge={badge} index={index} />
            )
        })}
      </div>
    </div>
  );
}
