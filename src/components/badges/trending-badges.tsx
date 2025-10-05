import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge, User } from '@/lib/mock-data';
import { useMemo } from 'react';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';

type TrendingBadge = Badge & {
    ownerName?: string;
    ownerEmoji?: string;
    followerCount: number;
    ownerCount: number;
};

function TrendingBadgeItem({ badge, index }: { badge: TrendingBadge, index: number }) {
    const firestore = useFirestore();
    const creatorRef = useMemo(() => firestore ? doc(firestore, 'users', badge.creatorId) : null, [firestore, badge.creatorId]);
    const { data: creator } = useDoc<User>(creatorRef);

    const badgesLeft = badge.tokens - badge.ownerCount;

    return (
        <Link href={`/dashboard/badge/${badge.id}`} className="block">
            <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-lg font-bold text-muted-foreground">
                <Flame className="h-5 w-5 text-accent" />
                <span>#{index + 1}</span>
            </div>
            <div className="text-3xl">{badge.emojis}</div>
            <div className="flex-grow">
                <p className="font-semibold">{badge.name}</p>
                {creator && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                            {creator.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-sm">{creator.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{creator.name?.charAt(0) ?? '?'}</AvatarFallback>
                            )}
                        </Avatar>
                        <span>{creator.name}</span>
                    </div>
                )}
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 font-semibold text-lg">
                    <Users className="h-5 w-5" />
                    <span>{badge.followerCount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{badgesLeft.toLocaleString()} / {badge.tokens.toLocaleString()} left</p>
            </div>
            </div>
        </Link>
    )
}


export function TrendingBadges() {
    const firestore = useFirestore();

    // This is not easily doable with firestore without duplicating follower counts on the badge doc.
    // For now, we will fetch all badges and then fetch their follower counts.
    // This is inefficient and not scalable. A better data model would store counts on the document.
    // Let's sort by creation date for now as a placeholder for "trending".
    const trendingQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'badges'), orderBy('createdAt', 'desc'), limit(5));
    }, [firestore]);

    const { data: badges, loading } = useCollection<Badge>(trendingQuery);

    if (loading) {
      return (
        <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <TrendingUp className="h-6 w-6" />
                Trending Badges
            </h2>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
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
        {badges?.map((badge, index) => (
            <TrendingBadgeItem key={badge.id} badge={{...badge, followerCount: 0, ownerCount: 0}} index={index} />
        ))}
      </div>
    </div>
  );
}
