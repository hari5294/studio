
'use client';

import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { getUserById, getBadgesByOwner, type User, type Badge as BadgeType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const user = getUserById(params.id);
  const ownedBadges = getBadgesByOwner(params.id);

  if (!user) {
    notFound();
  }

  return (
    <>
      <Header title="User Profile" />
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
              <p className="text-muted-foreground">Member</p>
            </div>
            {/* In a real app, you'd have more actions here */}
             <Button variant="outline" asChild>
                <Link href="#">Follow</Link>
             </Button>
          </CardContent>
        </Card>
        
        <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <Badge className="h-6 w-6" />
                Owned Badges ({ownedBadges.length})
            </h2>
            {ownedBadges.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ownedBadges.map((badge) => {
                    const followersData =
                    badge.followers
                        .map((id) => getUserById(id))
                        .filter(Boolean) as User[];
                    return <BadgeCard key={badge.id} badge={badge} followersData={followersData} />;
                })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">{user.name} hasn't created or claimed any badges yet.</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
}
