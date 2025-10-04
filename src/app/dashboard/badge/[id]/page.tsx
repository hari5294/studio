'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Share2, ArrowRightLeft, Crown, Send } from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Mock Data
type User = { id: string; name: string; email: string; avatarUrl: string; emojiAvatar?: string; following: string[]; };
type Badge = { id: string; name: string; emojis: string; tokens: number; ownerId: string; owners: string[]; followers: string[]; createdAt: number; };

const mockUsers: Record<string, User> = {
    '123': { id: '123', name: 'John Doe', email: 'john.doe@example.com', avatarUrl: 'https://picsum.photos/seed/123/100/100', emojiAvatar: '😀', following: ['456'] },
    '456': { id: '456', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: 'https://picsum.photos/seed/456/100/100', emojiAvatar: '👩‍💻', following: [] },
};
const mockBadges: Record<string, Badge> = {
  '1': { id: '1', name: 'Cosmic Explorer', emojis: '🚀✨', tokens: 1000, ownerId: '123', owners: ['123', '456'], followers: ['123', '456'], createdAt: Date.now() },
  '2': { id: '2', name: 'Ocean Diver', emojis: '🌊🐠', tokens: 500, ownerId: '456', owners: ['456'], followers: ['123'], createdAt: Date.now() },
};
const currentUserMock = mockUsers['123'];

function BadgeOwners({ badge }: { badge: Badge }) {
    const owners = badge.owners.map(id => mockUsers[id]).filter(Boolean);
    const loading = false;

    if (loading) {
        return <Skeleton className="h-32 w-full" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Crown className="h-6 w-6" />
                    Owners ({badge.owners.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {owners && owners.map((user) => (
                    <Link href={`/dashboard/profile/${user.id}`} key={user.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            {user.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{user.emojiAvatar}</span>
                            ) : (
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                            )}
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{user.name}</p>
                        {user.id === badge.ownerId && <span className="text-xs text-muted-foreground">(Creator)</span>}
                    </Link>
                ))}
                {(!owners || owners.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No one owns this badge yet.</p>
                )}
                </div>
            </CardContent>
        </Card>
    )
}

function BadgeFollowers({ badge }: { badge: Badge }) {
    const followers = badge.followers.map(id => mockUsers[id]).filter(Boolean);
    const loading = false;

     if (loading) {
        return <Skeleton className="h-48 w-full" />
    }
    
    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Followers ({badge.followers.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followers && followers.map((user) => (
                 <Link href={`/dashboard/profile/${user.id}`} key={user.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <Avatar>
                    {user.emojiAvatar ? (
                        <span className="flex h-full w-full items-center justify-center text-2xl">{user.emojiAvatar}</span>
                    ) : (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.name}</p>
                 </Link>
                ))}
                {(!followers || followers.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}


function BadgeDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const badge = mockBadges[params.id];
  const creator = badge ? mockUsers[badge.ownerId] : null;

  const [isShareOpen, setShareOpen] = useState(searchParams.get('showShare') === 'true');
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(badge?.followers.includes(currentUserMock.id));

  const isCreator = currentUserMock && badge && badge.ownerId === currentUserMock.id;
  const isOwner = currentUserMock && badge && badge.owners.includes(currentUserMock.id);
  
  if (!badge) {
    notFound();
  }
  
  const badgesLeft = badge.tokens - badge.owners.length;

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    toast({
        title: !isFollowing ? 'Followed!' : 'Unfollowed.',
        description: `You are now ${!isFollowing ? 'following' : 'no longer following'} "${badge.name}".`
    });
  }

  const handleRequestCode = async () => {
    toast({
        title: 'Request Sent!',
        description: `Your request for a code for "${badge.name}" has been sent to the owners.`,
    });
  }
  
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
                                    <AvatarImage src={creator?.avatarUrl} alt={creator?.name} />
                                    )}
                                    <AvatarFallback>{creator?.name.charAt(0)}</AvatarFallback>
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
                     className={cn({ 'invisible': !currentUserMock })}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                   </Button>
                   <Button 
                     variant='outline'
                     onClick={handleRequestCode}
                     className={cn({ 'invisible': !currentUserMock || !!isOwner })}
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
      <ShareBadgeDialog 
        open={isShareOpen} 
        onOpenChange={setShareOpen} 
        badge={badge} 
        links={[{linkId: 'mock-link-1', badgeId: badge.id, ownerId: '123', used: false, claimedBy: null}]}
        isLoading={false}
      />
      {currentUserMock && isCreator && (
        <TransferBadgeDialog 
            open={isTransferOpen} 
            onOpenChange={setTransferOpen} 
            badge={badge} 
            onTransfer={() => {}} 
        />
      )}
    </>
  );
}

export default function BadgeDetailPage({ params }: { params: { id: string } }) {
  return (
      <BadgeDetailContent params={params} />
  );
}
