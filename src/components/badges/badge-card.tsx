
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Badge, User } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

type BadgeCardProps = {
  badge: Badge;
  followersData: User[];
};

export function BadgeCard({ badge, followersData }: BadgeCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-4xl">{badge.emojis}</div>
          <div className="flex -space-x-2">
            {followersData.slice(0, 3).map((follower, index) => (
              <Avatar key={follower.id} className="h-8 w-8 border-2 border-card">
                {follower.emojiAvatar ? (
                    <span className="flex h-full w-full items-center justify-center text-lg">{follower.emojiAvatar}</span>
                ) : (
                    <AvatarImage src={follower.avatarUrl} alt={follower.name} />
                )}
                <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {badge.followers.length > 3 && (
              <Avatar className="h-8 w-8 border-2 border-card">
                <AvatarFallback>+{badge.followers.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
        <CardTitle className="pt-2 font-headline">{badge.name}</CardTitle>
        <CardDescription>
          {badge.tokens.toLocaleString()} Tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter>
        <Button asChild variant="ghost" className="w-full justify-start text-primary hover:text-primary">
          <Link href={`/dashboard/badge/${badge.id}`}>
            View Badge <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
