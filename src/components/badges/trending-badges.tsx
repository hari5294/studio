import Link from 'next/link';
import { useMockData, User, Badge } from '@/lib/mock-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type TrendingBadge = Badge & {
    ownerName?: string;
    ownerEmoji?: string;
};

function TrendingBadgeItem({ badge, creator, index }: { badge: TrendingBadge, creator?: User, index: number }) {
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
                    <span>{badge.followers.length.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{badgesLeft.toLocaleString()} / {badge.tokens.toLocaleString()} left</p>
            </div>
            </div>
        </Link>
    )
}


export function TrendingBadges() {
    const { badges, users, loading } = useMockData();

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

    const trendingBadges = [...badges]
        .sort((a, b) => b.followers.length - a.followers.length)
        .slice(0, 5);

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
        <TrendingUp className="h-6 w-6" />
        Trending Badges
      </h2>
      <div className="space-y-4">
        {trendingBadges.map((badge, index) => {
            const creator = users.find(u => u.id === badge.creatorId);
            return (
                <TrendingBadgeItem key={badge.id} badge={badge} creator={creator} index={index} />
            )
        })}
      </div>
    </div>
  );
}
