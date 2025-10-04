import { badges, getBadgeById, getUserById } from '@/lib/data';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame } from 'lucide-react';
import { getFirstEmoji } from '@/lib/utils';

export function TrendingBadges() {
  const trendingBadgesList = badges
    .map((badge, index) => ({
      ...badge,
      joinCount: badge.followers.length * 10 + index * 3, // mock metric
    }))
    .sort((a, b) => b.joinCount - a.joinCount)
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
          return (
            <Link href={`/dashboard/badge/${badge.id}`} key={badge.id} className="block">
              <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
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
                   <p className="font-semibold">{badge.followers.length}</p>
                   <p className="text-sm text-muted-foreground">Followers</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
