
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
import { ArrowRight, Users } from 'lucide-react';

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
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{badge.followers.length}</span>
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
