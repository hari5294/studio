
'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge, User as UserIcon, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useMockData, User } from '@/lib/mock-data';
import { EmojiBurst } from '@/components/effects/emoji-burst';


function ProfileHeaderCard({ user, isCurrentUserProfile }: { user: User, isCurrentUserProfile: boolean }) {
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const { followUser, unfollowUser, updateUser } = useMockData();
    const [isEditProfileOpen, setEditProfileOpen] = useState(false);
    const [burstEmoji, setBurstEmoji] = useState<string | null>(null);

    if (!currentUser) return null;

    const isFollowing = currentUser.following.includes(user.id);
    
    const handleFollowToggle = () => {
        if (user.id === currentUser.id) return; // Can't follow self
        
        const isNowFollowing = !isFollowing;
        if (isNowFollowing) {
            followUser(currentUser.id, user.id);
            if(user.emojiAvatar) {
                setBurstEmoji(user.emojiAvatar);
                setTimeout(() => setBurstEmoji(null), 2000);
            }
        } else {
            unfollowUser(currentUser.id, user.id);
        }
        toast({
            title: isNowFollowing ? 'Followed!' : 'Unfollowed.',
            description: `You are now ${isNowFollowing ? 'following' : 'no longer following'} ${user.name}.`
        });
    }

    const handleUpdateUser = async (updatedUser: Partial<User>) => {
        updateUser(user.id, updatedUser);
        toast({
            title: "Avatar Updated!",
            description: `Your profile picture has been updated.`,
        });
    };

    return (
        <>
            {burstEmoji && <EmojiBurst emojis={burstEmoji} />}
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                 <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        {user.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-5xl">{user.emojiAvatar}</span>
                        ) : (
                            <AvatarFallback className="text-3xl">{user.name?.charAt(0) ?? '?'}</AvatarFallback>
                        )}
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
    const { badges, loading } = useMockData();
    
    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    }

    const ownedBadges = badges.filter(b => b.owners.includes(userId));

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
    const { users, loading } = useMockData();
    const followingUsers = users.filter(u => user.following.includes(u.id));

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
                {loading ? <Skeleton className="h-16 w-full" /> : followingUsers.length > 0 ? followingUsers.map((followedUser) => (
                <Link href={`/dashboard/profile/${followedUser.id}`} key={followedUser.id}>
                    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <Avatar>
                        {followedUser.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-2xl">{followedUser.emojiAvatar}</span>
                        ) : (
                            <AvatarFallback>{followedUser.name.charAt(0)}</AvatarFallback>
                        )}
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
  const { user: currentUser } = useAuth();
  const { users, loading } = useMockData();

  const user = users.find(u => u.id === params.id);

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
  
  const isCurrentUserProfile = user.id === currentUser?.id;

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
