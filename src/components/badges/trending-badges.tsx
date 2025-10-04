

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users, Badge } from 'lucide-react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Badge as BadgeType, User } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function TrendingBadgeItem({ badge, index }: { badge: BadgeType, index: number }) {
    const firestore = useFirestore();
    const ownerDocRef = firestore ? doc(firestore, 'users', badge.ownerId) : null;
    const { data: owner, loading } = useDoc<User>(ownerDocRef);

    const badgesLeft = badge.tokens - badge.owners.length;

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
                {loading ? <Skeleton className="h-5 w-24" /> : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                            {owner?.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-sm">{owner.emojiAvatar}</span>
                            ) : (
                                <AvatarImage src={owner?.avatarUrl} alt={owner?.name} />
                            )}
                            <AvatarFallback>{owner?.name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <span>{owner?.name}</span>
                    </div>
                )}
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 font-semibold text-lg">
                    <Users className="h-5 w-5" />
                    <span>{badge.followers.length.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{badgesLeft.toLocaleString()} / {badge.tokens.toLocaleString()} left</p>
            </div>
            </div>
        </Link>
    )
}


export function TrendingBadges() {
  const firestore = useFirestore();
  // Note: This is not a true "trending" query. A real implementation would require a more complex
  // backend mechanism to calculate trending scores. We sort by follower count as a proxy.
  const trendingQuery = query(collection(firestore, 'badges'), orderBy('followers', 'desc'), limit(5));
  const { data: trendingBadgesList, loading } = useCollection<BadgeType>(trendingQuery);

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
        {trendingBadgesList?.map((badge, index) => (
            <TrendingBadgeItem key={badge.id} badge={badge} index={index} />
        ))}
      </div>
    </div>
  );
}
