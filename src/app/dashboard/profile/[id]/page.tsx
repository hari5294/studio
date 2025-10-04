
'use client';

import { useState, useEffect, useReducer } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { getUserById, getBadgesByOwner, toggleFollowUser, type User, type Badge as BadgeType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge, User as UserIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useIsClient } from '@/hooks/use-is-client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const isClient = useIsClient();
  const { toast } = useToast();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const [isFollowing, setIsFollowing] = useState(false);
  
  const currentUserId = 'user-1';
  const user = getUserById(params.id);
  const currentUser = getUserById(currentUserId);
  const ownedBadges = getBadgesByOwner(params.id);
  const followingUsers = user?.following.map(id => getUserById(id)).filter(Boolean) as User[];
  
  useEffect(() => {
    if (isClient && currentUser && user) {
        setIsFollowing(currentUser.following.includes(user.id));
    }
  }, [isClient, currentUser, user]);


  if (!user) {
    notFound();
  }

  const handleFollowToggle = () => {
    try {
        toggleFollowUser(currentUserId, user.id);
        const nowFollowing = !isFollowing;
        setIsFollowing(nowFollowing);
        toast({
            title: nowFollowing ? 'Followed!' : 'Unfollowed.',
            description: `You are now ${nowFollowing ? 'following' : 'no longer following'} ${user.name}.`
        });
        forceUpdate(); // Re-render to update follower list if viewing own profile
    } catch(e: any) {
        toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
        });
    }
  }

  return (
    <>
      <Header title="User Profile" />
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
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
                 {isClient && user.id !== currentUserId && (
                    <Button variant={isFollowing ? 'secondary' : 'outline'} onClick={handleFollowToggle}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                 )}
              </CardContent>
            </Card>
            
            <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                    <Badge className="h-6 w-6" />
                    Owned Badges ({ownedBadges.length})
                </h2>
                {ownedBadges.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="lg:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Following ({followingUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followingUsers.map((followedUser) => (
                    <Link href={`/dashboard/profile/${followedUser.id}`} key={followedUser.id}>
                        <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            <AvatarImage src={followedUser.avatarUrl} alt={followedUser.name} />
                            <AvatarFallback>{followedUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{followedUser.name}</p>
                        </div>
                    </Link>
                  ))}
                  {followingUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Not following anyone yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
