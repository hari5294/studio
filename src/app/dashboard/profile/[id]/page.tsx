'use client';

import { useState, useReducer } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { toggleFollowUser, type User as UserData, type Badge as BadgeType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge, User as UserIcon, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { useUser, useDoc, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CombinedUser } from '@/firebase/auth/use-user';


function ProfileHeaderCard({ user, isCurrentUserProfile }: { user: CombinedUser, isCurrentUserProfile: boolean }) {
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);
    const [isEditProfileOpen, setEditProfileOpen] = useState(false);

    const isFollowing = currentUser?.following?.includes(user.id) ?? false;
    
    const handleProfileUpdate = () => {
        forceUpdate();
    }

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        try {
            await toggleFollowUser(currentUser.uid, user.id);
            const nowFollowing = !isFollowing;
            toast({
                title: nowFollowing ? 'Followed!' : 'Unfollowed.',
                description: `You are now ${nowFollowing ? 'following' : 'no longer following'} ${user.name}.`
            });
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
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                 <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        {user.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-5xl">{user.emojiAvatar}</span>
                        ) : (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="text-3xl">{user.name?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    {isCurrentUserProfile && (
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                            onClick={() => setEditProfileOpen(true)}
                        >
                            <Edit className="h-4 w-4"/>
                        </Button>
                    )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
                  <p className="text-muted-foreground">Member</p>
                </div>
                 {!isCurrentUserProfile && currentUser && (
                    <Button variant={isFollowing ? 'secondary' : 'outline'} onClick={handleFollowToggle}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                 )}
              </CardContent>
            </Card>
            {isCurrentUserProfile && (
                <EditProfileDialog 
                    open={isEditProfileOpen} 
                    onOpenChange={setEditProfileOpen} 
                    user={user}
                    onUpdate={handleProfileUpdate}
                />
             )}
        </>
    )
}

function OwnedBadges({ userId }: { userId: string}) {
    const firestore = useFirestore();
    const badgesQuery = query(collection(firestore, 'badges'), where('owners', 'array-contains', userId));
    const { data: ownedBadges, loading } = useCollection<BadgeType>(badgesQuery);

    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    }

    return (
        <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <Badge className="h-6 w-6" />
                Owned Badges ({ownedBadges?.length ?? 0})
            </h2>
            {ownedBadges && ownedBadges.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ownedBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">This user hasn&apos;t created or claimed any badges yet.</p>
                </div>
            )}
        </div>
    )
}

function FollowingList({ user }: { user: CombinedUser }) {
    const firestore = useFirestore();
    
    // Create a query if the user is following anyone
    const followingQuery = user.following?.length > 0 
        ? query(collection(firestore, 'users'), where('id', 'in', user.following))
        : null;

    const { data: followingUsers, loading } = useCollection<UserData>(followingQuery);

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Following ({user.following?.length ?? 0})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {loading && user.following?.length > 0 && <p>Loading...</p>}

                {!loading && followingUsers && followingUsers.map((followedUser) => (
                <Link href={`/dashboard/profile/${followedUser.id}`} key={followedUser.id}>
                    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <Avatar>
                        {followedUser.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-2xl">{followedUser.emojiAvatar}</span>
                        ) : (
                            <AvatarImage src={followedUser.avatarUrl} alt={followedUser.name} />
                        )}
                        <AvatarFallback>{followedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{followedUser.name}</p>
                    </div>
                </Link>
                ))}
                {!loading && (!followingUsers || followingUsers.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">Not following anyone yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}


export default function UserProfilePage({ params }: { params: { id:string } }) {
  const { user: currentUser, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = doc(firestore, 'users', params.id);
  const { data: user, loading: profileUserLoading } = useDoc<CombinedUser>(userDocRef);

  if (userLoading || profileUserLoading) {
      return (
          <div className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
          </div>
      )
  }

  if (!user) {
    notFound();
  }
  
  const isCurrentUserProfile = user.id === currentUser?.uid;

  return (
    <>
      <Header title="User Profile" />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeaderCard user={user} isCurrentUserProfile={isCurrentUserProfile} />
            <OwnedBadges userId={user.id} />
          </div>
          <div className="lg:col-span-1 space-y-6">
             <FollowingList user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
