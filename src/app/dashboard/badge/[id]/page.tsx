'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import { useAtom } from 'jotai';
import { Header } from '@/components/layout/header';
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
import { badgesAtom, usersAtom, notificationsAtom, currentUserIdAtom, Badge, ShareLink, shareLinksAtom } from '@/lib/mock-data';

function BadgeOwners({ badgeId }: { badgeId: string }) {
    const [users] = useAtom(usersAtom);
    const [badges] = useAtom(badgesAtom);
    const badge = badges[badgeId];
    
    if (!badge) return <Skeleton className="h-32 w-full" />;

    const owners = badge.owners.map(id => users[id]).filter(Boolean);

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
                {owners.length > 0 ? owners.map((user) => (
                    <Link href={`/dashboard/profile/${user.id}`} key={user.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            {user.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{user.emojiAvatar}</span>
                            ) : (
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                            )}
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            {user.id === badge.creatorId && <span className="text-xs text-muted-foreground">(Creator)</span>}
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

function BadgeFollowers({ badgeId }: { badgeId: string }) {
    const [users] = useAtom(usersAtom);
    const [badges] = useAtom(badgesAtom);
    const badge = badges[badgeId];

    if (!badge) return <Skeleton className="h-48 w-full" />;

    const followers = badge.followers.map(id => users[id]).filter(Boolean);
    
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
                {followers.length > 0 ? followers.map((user) => (
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
                )) : (
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

  const [currentUserId] = useAtom(currentUserIdAtom);
  const [users] = useAtom(usersAtom);
  const [badges, setBadges] = useAtom(badgesAtom);
  const [shareLinks] = useAtom(shareLinksAtom);
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  
  const badge = badges[params.id];
  const creator = badge ? users[badge.creatorId] : null;

  const [isShareOpen, setShareOpen] = useState(searchParams.get('showShare') === 'true');
  const [isTransferOpen, setTransferOpen] = useState(false);

  if (!badge) {
    notFound();
  }
  
  const currentUser = users[currentUserId];
  const isCreator = currentUser && badge.creatorId === currentUser.id;
  const isOwner = currentUser && badge.owners.includes(currentUser.id);
  const isFollowing = currentUser && badge.followers.includes(currentUser.id);

  const badgesLeft = badge.tokens - badge.owners.length;

  const handleFollow = () => {
    if (!currentUser) return;
    const isNowFollowing = !isFollowing;
    
    setBadges(prev => ({
        ...prev,
        [badge.id]: {
            ...prev[badge.id],
            followers: isNowFollowing
                ? [...prev[badge.id].followers, currentUser.id]
                : prev[badge.id].followers.filter(id => id !== currentUser.id),
        }
    }));

    toast({
        title: isNowFollowing ? 'Followed!' : 'Unfollowed.',
        description: `You are now ${isNowFollowing ? 'following' : 'no longer following'} "${badge.name}".`
    });
  }

  const handleRequestCode = () => {
     if (!currentUser) return;
     const newNotificationId = `n${Object.keys(notifications).length + 1}`;
     setNotifications(prev => ({
         ...prev,
         [newNotificationId]: {
             id: newNotificationId,
             type: 'BADGE_REQUEST',
             userId: badge.creatorId,
             fromUserId: currentUser.id,
             badgeId: badge.id,
             createdAt: Date.now(),
             read: false,
         }
     }));
    toast({
        title: 'Request Sent!',
        description: `Your request for a code for "${badge.name}" has been sent to the creator.`,
    });
  }

  const handleTransfer = (newOwnerId: string) => {
    setBadges(prev => ({
        ...prev,
        [badge.id]: { ...prev[badge.id], creatorId: newOwnerId }
    }));
  };

  const userShareLinks = Object.values(shareLinks).filter(link => link.badgeId === badge.id && link.ownerId === currentUser?.id && !link.used);
  
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

            <BadgeOwners badgeId={badge.id} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BadgeFollowers badgeId={badge.id} />
          </div>
        </div>
      </div>
      {currentUser && (
        <ShareBadgeDialog 
          open={isShareOpen} 
          onOpenChange={setShareOpen} 
          badge={badge} 
          links={userShareLinks}
        />
      )}
      {currentUser && isCreator && (
        <TransferBadgeDialog 
            open={isTransferOpen} 
            onOpenChange={setTransferOpen} 
            badge={badge} 
            onTransfer={handleTransfer}
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
