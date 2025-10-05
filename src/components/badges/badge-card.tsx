import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';
import { Badge } from '@/lib/mock-data';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';

type BadgeCardProps = {
  badge: Badge;
};

export function BadgeCard({ badge }: BadgeCardProps) {
  const firestore = useFirestore();
  const ownersQuery = useMemo(() => firestore ? collection(firestore, `badges/${badge.id}/owners`) : null, [firestore, badge.id]);
  const followersQuery = useMemo(() => firestore ? collection(firestore, `badges/${badge.id}/followers`) : null, [firestore, badge.id]);
  
  const { data: owners } = useCollection(ownersQuery);
  const { data: followers } = useCollection(followersQuery);

  const badgesLeft = badge.tokens - (owners?.length || 0);

  return (
    <Card className="flex flex-col transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-4xl">{badge.emojis}</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{followers?.length ?? 0}</span>
          </div>
        </div>
        <CardTitle className="pt-2 font-headline">{badge.name}</CardTitle>
        <CardDescription>
          {badgesLeft.toLocaleString()} / {badge.tokens.toLocaleString()} left
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
