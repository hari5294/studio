
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Share2, ArrowRightLeft, Crown, Send } from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth, User } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Placeholder Data
const allBadges = [
    { id: 'b1', name: 'Galactic Pioneer', emojis: '🌌🚀✨', tokens: 50, creatorId: 'u3', owners: ['u3', 'u2'], followers: ['u3', 'u2', 'u1'] },
    { id: 'b2', name: 'Pixel Perfect', emojis: '🎨🖼️🖌️', tokens: 250, creatorId: 'u2', owners: ['u2'], followers: ['u2', 'u1'] },
    { id: 'b3', name: 'Code Ninja', emojis: '💻🥋🥷', tokens: 1000, creatorId: 'u1', owners: ['u1'], followers: ['u1', 'u2'] },
    { id: 'b4', name: 'Super Squad', emojis: '🦸‍♀️🦸‍♂️💥', tokens: 100, creatorId: 'u4', owners: ['u4'], followers: ['u4'] },
];
const allUsers = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', emojiAvatar: '👩‍💻', following: ['u2'] },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', emojiAvatar: '👨‍🎨', following: ['u1', 'u3'] },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', emojiAvatar: '👨‍🚀', following: ['u2'] },
    { id: 'u4', name: 'Diana', email: 'diana@example.com', emojiAvatar: '🦸‍♀️', following: [] },
];
type Badge = typeof allBadges[0];


function BadgeOwners({ badge }: { badge: Badge }) {
    const loading = false;

    if (loading) return <Skeleton className="h-32 w-full" />;

    const owners = allUsers.filter(u => badge.owners.includes(u.id));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Crown className="h-6 w-6" />
                    Owners ({owners.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {owners.length > 0 ? owners.map((owner) => (
                    <Link href={`/dashboard/profile/${owner.id}`} key={owner.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            {owner.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{owner.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                        <div>
                            <p className="font-medium">{owner.name}</p>
                            {badge.creatorId === owner.id && <CardDescription>Creator</CardDescription>}
                        </div>
                    </Link>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No one owns this badge yet.</p>
                )}
                </div>
            </CardContent>
        </Card>
    )
}

function BadgeFollowers({ badge }: { badge: Badge }) {
    const loading = false;
    
    if (loading) return <Skeleton className="h-48 w-full" />;

    const followers = allUsers.filter(u => badge.followers.includes(u.id));

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Followers ({followers.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followers.length > 0 ? followers.map((follower) => (
                    <Link href={`/dashboard/profile/${follower.id}`} key={follower.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                         <Avatar>
                            {follower.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{follower.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                        <p className="font-medium">{follower.name}</p>
                    </Link>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}

function BadgeDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();

  const id = params.id as string;
  const badge = allBadges.find(b => b.id === id);
  const creator = allUsers.find(u => u.id === badge?.creatorId);
  
  const [isShareOpen, setShareOpen] = useState(searchParams.get('showShare') === 'true');
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(currentUser && badge ? badge.followers.includes(currentUser.id) : false);

  if (authLoading) {
      return (
           <div className="flex-1 space-y-6 p-4 md:p-6">
                <Skeleton className="h-10 w-32" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
      )
  }

  if (!badge) {
    notFound();
  }
  
  const isCreator = currentUser && badge.creatorId === currentUser.id;
  const isOwner = currentUser && badge.owners.includes(currentUser.id);
  
  const badgesLeft = badge.tokens - badge.owners.length;

  const handleFollow = () => {
    if (!currentUser) return;
    setIsFollowing(!isFollowing);
    toast({
        title: !isFollowing ? 'Followed!' : 'Unfollowed.',
        description: `You are now ${!isFollowing ? 'following' : 'no longer following'} "${badge.name}".`
    });
  }

  const handleRequestCode = () => {
     if (!currentUser) return;
    toast({
        title: 'Request Sent!',
        description: `Your request for a code for "${badge.name}" has been sent to the creator.`,
    });
  }

  const handleTransfer = async (newOwnerId: string) => {
    toast({
        title: "Transfer Complete!",
        description: `Ownership of "${badge.name}" has been transferred.`,
    });
  };
  
  return (
    <>
      <Header title="Badge Details" />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-5xl md:text-6xl mb-4">{badge.emojis}</div>
                    <CardTitle className="font-headline text-2xl md:text-3xl">{badge.name}</CardTitle>
                    {creator && (
                        <CardDescription className="flex items-center gap-2 pt-2">
                            Created by
                            <Link href={`/dashboard/profile/${creator.id}`} className="flex items-center gap-2 hover:underline">
                                <Avatar className="h-6 w-6">
                                    {creator?.emojiAvatar ? (
                                    <span className="flex h-full w-full items-center justify-center text-lg">{creator.emojiAvatar}</span>
                                    ) : (
                                    <AvatarFallback>{creator?.name.charAt(0)}</AvatarFallback>
                                    )}
                                </Avatar>
                                {creator?.name}
                            </Link>
                        </CardDescription>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-3xl font-bold text-primary">{badgesLeft.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Badges Left</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        onClick={() => setShareOpen(true)} 
                        className={cn({ 'invisible': !isOwner })}
                        disabled={!isOwner}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTransferOpen(true)}
                    className={cn({ 'invisible': !isCreator })}
                    disabled={!isCreator}
                  >
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transfer
                  </Button>
                   <Button 
                     variant={isFollowing ? 'secondary' : 'outline'} 
                     onClick={handleFollow}
                     className={cn({ 'invisible': !currentUser })}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                   </Button>
                   <Button 
                     variant='outline'
                     onClick={handleRequestCode}
                     className={cn({ 'invisible': !currentUser || !!isOwner })}
                     disabled={!!isOwner}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Request Code
                   </Button>
                </div>
              </CardContent>
            </Card>

            <BadgeOwners badge={badge} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BadgeFollowers badge={badge} />
          </div>
        </div>
      </div>
      {currentUser && (
        <ShareBadgeDialog 
          open={isShareOpen} 
          onOpenChange={setShareOpen} 
          badge={badge} 
          user={currentUser} 
        />
      )}
      {currentUser && isCreator && (
        <TransferBadgeDialog 
            open={isTransferOpen} 
            onOpenChange={setTransferOpen} 
            badge={badge} 
            onTransfer={handleTransfer}
            users={allUsers.filter(u => badge.owners.includes(u.id))}
        />
      )}
    </>
  );
}

export default function BadgeDetailPage() {
  return (
      <BadgeDetailContent />
  );
}

    