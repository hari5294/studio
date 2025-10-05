
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMockData } from '@/hooks/use-mock-data';
import { useMemo } from 'react';

function TrendingBadgeItem({ badge, index }: { badge: any, index: number }) {
    const badgesLeft = badge.tokens - (badge.owners?.length || 0);

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
    const { badges, getBadgeWithDetails } = useMockData();

    const trendingBadges = useMemo(() => {
        return badges
            .map(b => getBadgeWithDetails(b.id))
            .filter(Boolean)
            .sort((a,b) => (b.followers?.length || 0) - (a.followers?.length || 0))
            .slice(0, 5);
    }, [badges, getBadgeWithDetails]);


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
