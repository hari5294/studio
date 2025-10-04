
import { getAllBadges, getUserById } from '@/lib/data';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { getFirstEmoji } from '@/lib/utils';

export function TrendingBadges() {
  const trendingBadgesList = getAllBadges()
    .map((badge, index) => ({
      ...badge,
      // a mock metric based on followers and a bit of randomness
      sortMetric: badge.followers.length * 10 + index * 3, 
    }))
    .sort((a, b) => b.sortMetric - a.sortMetric)
    .slice(0, 5);

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
        <TrendingUp className="h-6 w-6" />
        Trending Badges
      </h2>
      <div className="space-y-4">
        {trendingBadgesList.map((badge, index) => {
          if (!badge) return null;
          const owner = getUserById(badge.ownerId);
          const badgesLeft = badge.tokens - badge.owners.length;
          return (
            <Link href={`/dashboard/badge/${badge.id}`} key={badge.id} className="block">
              <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-lg font-bold text-muted-foreground">
                  <Flame className="h-5 w-5 text-accent" />
                  <span>#{index + 1}</span>
                </div>
                <div className="text-3xl">{getFirstEmoji(badge.emojis)}</div>
                <div className="flex-grow">
                  <p className="font-semibold">{badge.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={owner?.avatarUrl} alt={owner?.name} />
                        <AvatarFallback>{owner?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{owner?.name}</span>
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}
