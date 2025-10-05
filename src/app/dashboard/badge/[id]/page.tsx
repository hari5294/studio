
'use client';

import { useState, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge, ShareLink, User, BadgeOwner, BadgeFollower } from '@/lib/mock-data';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useAuth, useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, writeBatch, deleteDoc, setDoc, addDoc } from 'firebase/firestore';

function BadgeOwners({ badgeId }: { badgeId: string }) {
    const firestore = useFirestore();
    const ownersQuery = useMemo(() => firestore ? collection(firestore, 'badges', badgeId, 'owners') : null, [firestore, badgeId]);
    const { data: owners, loading } = useCollection<BadgeOwner>(ownersQuery);

    if (loading) return <Skeleton className="h-32 w-full" />;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Crown className="h-6 w-6" />
                    Owners ({owners?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {owners && owners.length > 0 ? owners.map((owner) => (
                    <OwnerItem key={owner.userId} userId={owner.userId} />
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No one owns this badge yet.</p>
                )}
                </div>
            </CardContent>
        </Card>
    )
}

function OwnerItem({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userRef = useMemo(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, loading } = useDoc<User>(userRef);

    if (loading || !user) return <Skeleton className="h-12 w-full" />;

    return (
        <Link href={`/dashboard/profile/${user.id}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
            <Avatar>
                {user.emojiAvatar ? (
                    <span className="flex h-full w-full items-center justify-center text-2xl">{user.emojiAvatar}</span>
                ) : (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                )}
            </Avatar>
            <div>
                <p className="font-medium">{user.name}</p>
                {/* Creator check needs badge data, simplified for now */}
            </div>
        </Link>
    );
}


function BadgeFollowers({ badgeId }: { badgeId: string }) {
    const firestore = useFirestore();
    const followersQuery = useMemo(() => firestore ? collection(firestore, 'badges', badgeId, 'followers') : null, [firestore, badgeId]);
    const { data: followers, loading } = useCollection<BadgeFollower>(followersQuery);

    if (loading) return <Skeleton className="h-48 w-full" />;

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Followers ({followers?.length || 0})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followers && followers.length > 0 ? followers.map((follower) => (
                 <FollowerItem key={follower.userId} userId={follower.userId} />
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}

function FollowerItem({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userRef = useMemo(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, loading } = useDoc<User>(userRef);
    
    if (loading || !user) return <Skeleton className="h-12 w-full" />;

    return (
        <Link href={`/dashboard/profile/${user.id}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
            <Avatar>
            {user.emojiAvatar ? (
                <span className="flex h-full w-full items-center justify-center text-2xl">{user.emojiAvatar}</span>
            ) : (
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            )}
            </Avatar>
            <p className="font-medium">{user.name}</p>
        </Link>
    );
}

function BadgeDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const firestore = useFirestore();
  const id = params.id as string;

  const badgeRef = useMemo(() => firestore ? doc(firestore, 'badges', id) : null, [firestore, id]);
  const { data: badge, loading: badgeLoading } = useDoc<Badge>(badgeRef);
  
  const creatorRef = useMemo(() => firestore && badge ? doc(firestore, 'users', badge.creatorId) : null, [firestore, badge]);
  const { data: creator } = useDoc<User>(creatorRef);

  const ownersQuery = useMemo(() => firestore ? collection(firestore, 'badges', id, 'owners') : null, [firestore, id]);
  const { data: owners, loading: ownersLoading } = useCollection<BadgeOwner>(ownersQuery);

  const followersQuery = useMemo(() => firestore ? collection(firestore, 'badges', id, 'followers') : null, [firestore, id]);
  const { data: followers, loading: followersLoading } = useCollection<BadgeFollower>(followersQuery);

  const shareLinksQuery = useMemo(() => firestore && currentUser ? collection(firestore, 'shareLinks') : null, [firestore, currentUser]);
  const { data: allShareLinks, loading: shareLinksLoading } = useCollection<ShareLink>(shareLinksQuery);

  const [isShareOpen, setShareOpen] = useState(searchParams.get('showShare') === 'true');
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  const loading = badgeLoading || ownersLoading || followersLoading || shareLinksLoading;

  if (loading) {
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
  const isOwner = currentUser && owners?.some(o => o.userId === currentUser.id);
  const isFollowing = currentUser && followers?.some(f => f.userId === currentUser.id);
  
  const badgesLeft = badge.tokens - (owners?.length || 0);

  const handleFollow = async () => {
    if (!currentUser || !firestore) return;

    const followerRef = doc(firestore, 'badges', id, 'followers', currentUser.id);
    
    try {
        if(isFollowing) {
            await deleteDoc(followerRef);
        } else {
            await setDoc(followerRef, { userId: currentUser.id, badgeId: id, followedAt: Date.now() });
            setBurstEmojis(badge.emojis);
            setTimeout(() => setBurstEmojis(null), 2000);
        }
        toast({
            title: isFollowing ? 'Unfollowed.' : 'Followed!',
            description: `You are now ${isFollowing ? 'no longer following' : 'following'} "${badge.name}".`
        });
    } catch(e) {
        toast({ title: 'Error', description: 'Could not update follow status.', variant: 'destructive'});
    }
  }

  const handleRequestCode = async () => {
     if (!currentUser || !firestore) return;
     const notificationRef = collection(firestore, 'users', badge.creatorId, 'notifications');
     await addDoc(notificationRef, {
         type: 'BADGE_REQUEST',
         userId: badge.creatorId,
         fromUserId: currentUser.id,
         badgeId: id,
         createdAt: Date.now(),
         read: false,
     });
    toast({
        title: 'Request Sent!',
        description: `Your request for a code for "${badge.name}" has been sent to the creator.`,
    });
  }

  const handleTransfer = async (newOwnerId: string) => {
    if (!firestore) return;
    await updateDoc(badgeRef, { creatorId: newOwnerId });
  };

  const userShareLinks = allShareLinks?.filter(link => link.badgeId === id && link.ownerId === currentUser?.id && !link.used) ?? [];
  
  return (
    <>
      <Header title="Badge Details" />
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
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

            <BadgeOwners badgeId={id} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BadgeFollowers badgeId={id} />
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

export default function BadgeDetailPage() {
  return (
      <BadgeDetailContent />
  );
}
