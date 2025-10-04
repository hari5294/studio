'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
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

// Mock Data
const mockUsers = {
    '123': { id: '123', name: 'John Doe', email: 'john.doe@example.com', avatarUrl: 'https://picsum.photos/seed/123/100/100', emojiAvatar: '😀', following: ['456'] },
    '456': { id: '456', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: 'https://picsum.photos/seed/456/100/100', emojiAvatar: '👩‍💻', following: [] },
};
const mockBadges = [
  { id: '1', name: 'Cosmic Explorer', emojis: '🚀✨', tokens: 1000, owners: ['123'], followers: ['123', '456'], createdAt: Date.now(), ownerId: '123' },
  { id: '2', name: 'Ocean Diver', emojis: '🌊🐠', tokens: 500, owners: ['123'], followers: ['456'], createdAt: Date.now(), ownerId: '456' },
];
const currentUserMock = mockUsers['123'];

function ProfileHeaderCard({ user, isCurrentUserProfile }: { user: any, isCurrentUserProfile: boolean }) {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(currentUserMock.following.includes(user.id));
    const [isEditProfileOpen, setEditProfileOpen] = useState(false);
    
    const handleFollowToggle = async () => {
        setIsFollowing(!isFollowing);
        toast({
            title: !isFollowing ? 'Followed!' : 'Unfollowed.',
            description: `You are now ${!isFollowing ? 'following' : 'no longer following'} ${user.name}.`
        });
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
                    onUpdate={() => {}}
                />
             )}
        </>
    )
}

function OwnedBadges({ userId }: { userId: string}) {
    const ownedBadges = mockBadges.filter(b => b.owners.includes(userId));
    const loading = false;

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
                {ownedBadges.map((badge) => <BadgeCard key={badge.id} badge={badge as any} />)}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">This user hasn&apos;t created or claimed any badges yet.</p>
                </div>
            )}
        </div>
    )
}

function FollowingList({ user }: { user: any }) {
    const followingUsers = user.following.map((id: string) => mockUsers[id as keyof typeof mockUsers]).filter(Boolean);
    const loading = false;

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

                {!loading && followingUsers && followingUsers.map((followedUser: any) => (
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
  const user = mockUsers[params.id as keyof typeof mockUsers];
  const loading = false;

  if (loading) {
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
  
  const isCurrentUserProfile = user.id === currentUserMock?.id;

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
