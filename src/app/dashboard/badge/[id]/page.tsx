'use client';

import { useState, useReducer, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { followBadge, requestBadgeCode, createShareLinks, getShareLinksForUser, type User, type ShareLink, type Badge } from '@/lib/data';
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
import { useUser, useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function BadgeOwners({ badge }: { badge: Badge }) {
    const firestore = useFirestore();
    const ownersQuery = badge.owners.length > 0
        ? query(collection(firestore, 'users'), where('id', 'in', badge.owners))
        : null;

    const { data: owners, loading } = useCollection<User>(ownersQuery);

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
    const firestore = useFirestore();
    const followersQuery = badge.followers.length > 0
        ? query(collection(firestore, 'users'), where('id', 'in', badge.followers))
        : null;
    const { data: followers, loading } = useCollection<User>(followersQuery);

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
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const badgeDocRef = doc(firestore, 'badges', params.id);
  const { data: badge, loading: badgeLoading } = useDoc<Badge>(badgeDocRef);
  
  const creatorDocRef = badge ? doc(firestore, 'users', badge.ownerId) : null;
  const { data: creator, loading: creatorLoading } = useDoc<User>(creatorDocRef);

  const [isShareOpen, setShareOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [shareLinksLoading, setShareLinksLoading] = useState(false);
  
  const isCreator = currentUser && badge && badge.ownerId === currentUser.uid;
  const isOwner = currentUser && badge && badge.owners.includes(currentUser.uid);
  const isFollowing = currentUser && badge && badge.followers.includes(currentUser.uid);

  const fetchShareLinks = async () => {
    if (!badge || !currentUser) return;
    setShareLinksLoading(true);
    let userLinks = await getShareLinksForUser(badge.id, currentUser.uid);
    // If user is an owner but has no links, try to create some
    if (userLinks.length === 0 && isOwner) {
        userLinks = await createShareLinks(badge.id, currentUser.uid, 3);
    }
    setShareLinks(userLinks);
    setShareLinksLoading(false);
  };
  
  useState(() => {
    const showShare = searchParams.get('showShare') === 'true';
    if (showShare) {
        setShareOpen(true);
        router.replace(`/dashboard/badge/${params.id}`, { scroll: false });
    }
  });

  useState(() => {
    if (isShareOpen) fetchShareLinks();
  }, [isShareOpen]);
  
  if (userLoading || badgeLoading || creatorLoading) {
    return <div className="p-4 md:p-6"><Skeleton className="h-screen w-full" /></div>;
  }

  if (!badge) {
    notFound();
  }
  
  const badgesLeft = badge.tokens - badge.owners.length;

  const handleFollow = async () => {
    if (!currentUser) return;
    await followBadge(badge.id, currentUser.uid);
    toast({
        title: !isFollowing ? 'Followed!' : 'Unfollowed.',
        description: `You are now ${!isFollowing ? 'following' : 'no longer following'} "${badge.name}".`
    });
  }

  const handleRequestCode = async () => {
    if (!currentUser) return;
    try {
        await requestBadgeCode(badge.id, currentUser.uid);
        toast({
            title: 'Request Sent!',
            description: `Your request for a code for "${badge.name}" has been sent to the owners.`,
        });
    } catch (e: any) {
         toast({
            title: 'Request Failed',
            description: e.message,
            variant: 'destructive'
        });
    }
  }

  const handleShareClick = () => {
    fetchShareLinks();
    setShareOpen(true);
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
                        onClick={handleShareClick} 
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
                     className={cn({ 'invisible': !currentUser || isOwner })}
                     disabled={isOwner}
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
        links={shareLinks}
        isLoading={shareLinksLoading}
      />
      {currentUser && isCreator && (
        <TransferBadgeDialog 
            open={isTransferOpen} 
            onOpenChange={setTransferOpen} 
            badge={badge} 
            onTransfer={forceUpdate} 
        />
      )}
    </>
  );
}

export default function BadgeDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BadgeDetailContent params={params} />
    </Suspense>
  );
}
