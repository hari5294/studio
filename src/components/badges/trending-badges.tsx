import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtom } from 'jotai';
import { badgesAtom, usersAtom, Badge } from '@/lib/mock-data';
import { useState, useEffect } from 'react';

type TrendingBadge = Badge & {
    ownerName?: string;
    ownerAvatar?: string;
    ownerEmoji?: string;
};

function TrendingBadgeItem({ badge, index }: { badge: TrendingBadge, index: number }) {
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
                {badge.ownerName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                            {badge.ownerEmoji ? (
                                <span className="flex h-full w-full items-center justify-center text-sm">{badge.ownerEmoji}</span>
                            ) : (
                                <AvatarImage src={badge.ownerAvatar} alt={badge.ownerName} />
                            )}
                            <AvatarFallback>{badge.ownerName?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <span>{badge.ownerName}</span>
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
  const [badges] = useAtom(badgesAtom);
  const [users] = useAtom(usersAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const trendingBadges: TrendingBadge[] = Object.values(badges)
    .sort((a,b) => b.followers.length - a.followers.length)
    .slice(0, 5)
    .map(badge => {
        const creator = users[badge.creatorId];
        return {
            ...badge,
            ownerName: creator?.name,
            ownerAvatar: creator?.avatarUrl,
            ownerEmoji: creator?.emojiAvatar,
        }
    });

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
        {trendingBadges.map((badge, index) => (
            <TrendingBadgeItem key={badge.id} badge={badge} index={index} />
        ))}
      </div>
    </div>
  );
}
