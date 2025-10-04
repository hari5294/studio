'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useAtom } from 'jotai';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge, User as UserIcon, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usersAtom, badgesAtom, currentUserIdAtom, User } from '@/lib/mock-data';

function ProfileHeaderCard({ user, isCurrentUserProfile }: { user: User, isCurrentUserProfile: boolean }) {
    const { toast } = useToast();
    const [currentUserId] = useAtom(currentUserIdAtom);
    const [users, setUsers] = useAtom(usersAtom);
    const currentUser = users[currentUserId];

    const [isEditProfileOpen, setEditProfileOpen] = useState(false);
    
    if (!currentUser) return null; // Should not happen if there's a current user

    const isFollowing = currentUser.following.includes(user.id);
    
    const handleFollowToggle = () => {
        if (user.id === currentUser.id) return; // Can't follow self
        const isNowFollowing = !isFollowing;
        
        setUsers(prev => {
            const updatedUser = {
                ...prev[currentUser.id],
                following: isNowFollowing
                    ? [...prev[currentUser.id].following, user.id]
                    : prev[currentUser.id].following.filter(id => id !== user.id)
            };
            return { ...prev, [currentUser.id]: updatedUser };
        });

        toast({
            title: isNowFollowing ? 'Followed!' : 'Unfollowed.',
            description: `You are now ${isNowFollowing ? 'following' : 'no longer following'} ${user.name}.`
        });
    }

    const handleUpdateUser = (updatedUser: Partial<User>) => {
        setUsers(prev => ({
            ...prev,
            [user.id]: { ...prev[user.id], ...updatedUser }
        }));
    };

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
                 {!isCurrentUserProfile && (
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
                    onUpdate={handleUpdateUser}
                />
             )}
        </>
    )
}

function OwnedBadges({ userId }: { userId: string}) {
    const [badges] = useAtom(badgesAtom);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 300);
    }, []);

    const ownedBadges = Object.values(badges).filter(b => b.owners.includes(userId));
    
    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    }

    return (
        <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <Badge className="h-6 w-6" />
                Owned Badges ({ownedBadges.length})
            </h2>
            {ownedBadges.length > 0 ? (
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

function FollowingList({ user }: { user: User }) {
    const [allUsers] = useAtom(usersAtom);
    const followingUsers = user.following.map(id => allUsers[id]).filter(Boolean);

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Following ({user.following.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followingUsers.length > 0 ? followingUsers.map((followedUser) => (
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
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Not following anyone yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}


export default function UserProfilePage({ params }: { params: { id:string } }) {
  const [users] = useAtom(usersAtom);
  const [currentUserId] = useAtom(currentUserIdAtom);
  const [loading, setLoading] = useState(true);

  const user = users[params.id];

  useEffect(() => {
      setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
      return (
        <>
          <Header title="User Profile" />
          <div className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-48 w-full lg:w-2/3" />
              <Skeleton className="h-64 w-full" />
          </div>
        </>
      )
  }

  if (!user) {
    notFound();
  }
  
  const isCurrentUserProfile = user.id === currentUserId;

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
