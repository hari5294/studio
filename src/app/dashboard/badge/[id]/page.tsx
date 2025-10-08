
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Share2, ArrowRightLeft, Crown, Send, Check } from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useDoc, useCollection, firestore } from '@/firebase';
import { AppUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { doc, collection, writeBatch, serverTimestamp, deleteDoc, setDoc, addDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { EmojiBurst } from '@/components/effects/emoji-burst';

type BadgeType = {
  id: string;
  name: string;
  emojis: string;
  tokens: number;
  creatorId: string;
  createdAt: any;
};

type UserProfile = {
  id: string;
  name: string;
  emojiAvatar?: string;
}

function BadgeOwners({ badgeId, creatorId }: { badgeId: string, creatorId: string }) {
    const ownersRef = collection(firestore, `badges/${badgeId}/owners`);
    const { data: owners, loading } = useCollection(ownersRef);
    const [ownerProfiles, setOwnerProfiles] = useState<UserProfile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    useEffect(() => {
        if (!owners) return;
        
        const fetchProfiles = async () => {
            setLoadingProfiles(true);
            const userIds = owners.map(o => o.userId);
            if (userIds.length === 0) {
                setOwnerProfiles([]);
                setLoadingProfiles(false);
                return;
            }
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('__name__', 'in', userIds));
            const querySnapshot = await getDocs(q);
            const profiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setOwnerProfiles(profiles);
            setLoadingProfiles(false);
        }
        fetchProfiles();
    }, [owners]);

    if (loading || loadingProfiles) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Crown className="h-6 w-6" />
                    Owners ({ownerProfiles.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {ownerProfiles.length > 0 ? ownerProfiles.map((owner) => (
                    <Link href={`/dashboard/profile/${owner.id}`} key={owner.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            {owner.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{owner.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{owner.name?.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                        <div>
                            <p className="font-medium">{owner.name}</p>
                            {creatorId === owner.id && <CardDescription>Creator</CardDescription>}
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
    const followersRef = collection(firestore, `badges/${badgeId}/followers`);
    const { data: followers, loading } = useCollection(followersRef);
    const [followerProfiles, setFollowerProfiles] = useState<UserProfile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

     useEffect(() => {
        if (!followers) return;
        
        const fetchProfiles = async () => {
            setLoadingProfiles(true);
            const userIds = followers.map(f => f.userId);
            if (userIds.length === 0) {
                setFollowerProfiles([]);
                setLoadingProfiles(false);
                return;
            }
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('__name__', 'in', userIds));
            const querySnapshot = await getDocs(q);
            const profiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setFollowerProfiles(profiles);
            setLoadingProfiles(false);
        }
        fetchProfiles();
    }, [followers]);


    if (loading || loadingProfiles) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Followers ({followerProfiles.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followerProfiles.length > 0 ? followerProfiles.map((follower) => (
                    <Link href={`/dashboard/profile/${follower.id}`} key={follower.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                         <Avatar>
                            {follower.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-2xl">{follower.emojiAvatar}</span>
                            ) : (
                                <AvatarFallback>{follower.name?.charAt(0)}</AvatarFallback>
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
  const { user: currentUser, loading: authLoading } = useUser();
  
  const id = params.id as string;
  const badgeRef = doc(firestore, 'badges', id);
  const { data: badge, loading: badgeLoading } = useDoc<Omit<BadgeType, 'id'>>(badgeRef);

  const ownersRef = collection(firestore, `badges/${id}/owners`);
  const { data: owners, loading: ownersLoading } = useCollection(ownersRef);

  const followersRef = collection(firestore, `badges/${id}/followers`);
  const { data: followers, loading: followersLoading } = useCollection(followersRef);
  
  const creatorId = badge?.creatorId;
  const creatorRef = creatorId ? doc(firestore, 'users', creatorId) : null;
  const { data: creator, loading: creatorLoading } = useDoc<AppUser>(creatorRef);


  const [isShareOpen, setShareOpen] = useState(searchParams.get('showShare') === 'true');
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('burst') === 'true' && badge) {
      setBurstEmojis(badge.emojis);
      // Clean up the URL
      const newUrl = `/dashboard/badge/${id}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      setTimeout(() => setBurstEmojis(null), 2000);
    }
  }, [searchParams, badge, id]);

  const isLoading = authLoading || badgeLoading || ownersLoading || followersLoading || creatorLoading;

  if (isLoading) {
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
  
  const isCreator = currentUser && badge.creatorId === currentUser.uid;
  const isOwner = currentUser && owners?.some(o => o.userId === currentUser.uid);
  const isFollowing = currentUser && followers?.some(f => f.userId === currentUser.uid);
  const badgesLeft = badge.tokens - (owners?.length || 0);

  const handleFollow = async () => {
    if (!currentUser) return;
    const followerDocRef = doc(firestore, `badges/${id}/followers`, currentUser.uid);

    try {
        if (isFollowing) {
            await deleteDoc(followerDocRef);
            toast({
                title: 'Unfollowed.',
                description: `You are no longer following "${badge.name}".`
            });
        } else {
            await setDoc(followerDocRef, {
                userId: currentUser.uid,
                badgeId: id,
                followedAt: serverTimestamp()
            });
            toast({
                title: 'Followed!',
                description: `You are now following "${badge.name}".`
            });
        }
    } catch(error) {
        console.error("Error following/unfollowing badge: ", error);
        toast({ title: "Something went wrong", variant: "destructive" });
    }
  }

  const handleRequestCode = async () => {
     if (!currentUser || !badge.creatorId) return;
     setIsRequesting(true);
     const notificationRef = collection(firestore, `users/${badge.creatorId}/notifications`);
     try {
        await addDoc(notificationRef, {
            type: 'BADGE_REQUEST',
            fromUserId: currentUser.uid,
            badgeId: id,
            createdAt: serverTimestamp(),
            read: false
        });
        toast({
            title: 'Request Sent!',
            description: `Your request for a code for "${badge.name}" has been sent to the creator.`,
        });
     } catch(error) {
        console.error("Error requesting code: ", error);
        toast({ title: "Could not send request", variant: "destructive" });
        setIsRequesting(false); // only reset on error
     }
  }

  const handleTransfer = async (newOwnerId: string) => {
    if (!currentUser || !isCreator) return;

    try {
        const batch = writeBatch(firestore);
        // 1. Update the creatorId on the badge
        batch.update(badgeRef, { creatorId: newOwnerId });

        // 2. Send notification to new owner
        const notificationRef = doc(collection(firestore, `users/${newOwnerId}/notifications`));
        batch.set(notificationRef, {
            type: 'OWNERSHIP_TRANSFER',
            fromUserId: currentUser.uid,
            badgeId: id,
            createdAt: serverTimestamp(),
            read: false,
        });

        await batch.commit();

        const newOwnerDoc = await getDoc(doc(firestore, 'users', newOwnerId));
        const newOwnerName = newOwnerDoc.data()?.name || 'the new owner';

        toast({
            title: "Transfer Complete!",
            description: `Ownership of "${badge.name}" has been transferred to ${newOwnerName}.`,
        });
        setTransferOpen(false);
    } catch(error) {
        console.error("Error transferring ownership: ", error);
        toast({ title: "Transfer failed", variant: "destructive"});
    }
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
                                    {creator.emojiAvatar ? (
                                    <span className="flex h-full w-full items-center justify-center text-lg">{creator.emojiAvatar}</span>
                                    ) : (
                                    <AvatarFallback>{creator.name?.charAt(0)}</AvatarFallback>
                                    )}
                                </Avatar>
                                {creator.name}
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
                     disabled={!currentUser}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                   </Button>
                   <Button 
                     variant='outline'
                     onClick={handleRequestCode}
                     className={cn({ 'invisible': !currentUser || !!isOwner })}
                     disabled={!currentUser || !!isOwner || isRequesting}
                    >
                      {isRequesting ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Request Sent
                          </>
                      ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Request Code
                          </>
                      )}
                   </Button>
                </div>
              </CardContent>
            </Card>

            <BadgeOwners badgeId={id} creatorId={badge.creatorId} />
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
          badge={{...badge, id}}
          user={currentUser} 
        />
      )}
      {currentUser && isCreator && owners && (
        <TransferBadgeDialog 
            open={isTransferOpen} 
            onOpenChange={setTransferOpen} 
            badge={{...badge, id}}
            onTransfer={handleTransfer}
            // Pass user IDs of owners, excluding the creator
            ownerUserIds={owners.map(o => o.userId).filter(uid => uid !== currentUser.uid)}
        />
      )}
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
    </>
  );
}

export default function BadgeDetailPage() {
  return (
      <BadgeDetailContent />
  );
}
