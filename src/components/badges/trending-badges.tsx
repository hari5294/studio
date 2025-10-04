import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
const mockTrendingBadges = [
  { id: '1', name: 'Cosmic Explorer', emojis: '🚀✨', tokens: 1000, owners: ['1', '2', '3'], followers: ['1', '2', '3', '4', '5'], createdAt: Date.now(), ownerId: '1', ownerName: 'John Doe', ownerAvatar: 'https://picsum.photos/seed/1/32/32', ownerEmoji: '😀' },
  { id: '4', name: 'Synthwave Rider', emojis: '🌆🎶', tokens: 1984, owners: ['4'], followers: ['1', '4'], createdAt: Date.now(), ownerId: '4', ownerName: 'Alex Ray', ownerAvatar: 'https://picsum.photos/seed/4/32/32' },
  { id: '5', name: 'Eco Warrior', emojis: '🌳♻️', tokens: 2050, owners: ['5', '1'], followers: ['5'], createdAt: Date.now(), ownerId: '5', ownerName: 'Sara Green' },
  { id: '2', name: 'Ocean Diver', emojis: '🌊🐠', tokens: 500, owners: ['1'], followers: ['2', '3'], createdAt: Date.now(), ownerId: '2', ownerName: 'Jane Smith', ownerAvatar: 'https://picsum.photos/seed/2/32/32', ownerEmoji: '👩‍💻' },
  { id: '3', name: 'Pixel Artist', emojis: '🎨👾', tokens: 100, owners: [], followers: [], createdAt: Date.now(), ownerId: '3', ownerName: 'Chris Pixel' },
];

function TrendingBadgeItem({ badge, index }: { badge: any, index: number }) {
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
  const loading = false;

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
        {mockTrendingBadges?.map((badge, index) => (
            <TrendingBadgeItem key={badge.id} badge={badge} index={index} />
        ))}
      </div>
    </div>
  );
}
