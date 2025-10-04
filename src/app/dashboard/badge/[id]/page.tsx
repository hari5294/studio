
'use client';

import { useState, useEffect, useReducer, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBadgeById, getUserById, User, followBadge, ShareLink, getShareLinksForUser, createShareLinks } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  Users,
  Share2,
  ArrowRightLeft,
  Crown
} from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsClient } from '@/hooks/use-is-client';

function BadgeDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const badge = getBadgeById(params.id);

  const [isShareOpen, setShareOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const isClient = useIsClient();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  
  const currentUserId = 'user-1';

  const fetchShareLinks = () => {
    if (badge) {
      const userLinks = getShareLinksForUser(badge.id, currentUserId);
      setShareLinks(userLinks);
    }
  };

  const generateNewShareLinks = () => {
    if (badge) {
      const newLinks = createShareLinks(badge.id, currentUserId, 3);
       if (newLinks.length === 0) {
            toast({ title: "No more badges to share!", description: "The token limit for this badge has been reached.", variant: "default" });
        } else {
            toast({ title: "New share codes generated!", description: "You have new unique codes to share.", variant: "default" });
        }
      fetchShareLinks(); // Re-fetch to update the list
    }
  };

  useEffect(() => {
    if (badge && isClient) {
      setIsCreator(badge.ownerId === currentUserId);
      setIsOwner(badge.owners.includes(currentUserId));
      setIsFollowing(badge.followers.includes(currentUserId));

      const showShare = searchParams.get('showShare') === 'true';

      if (showShare) {
        fetchShareLinks();
        setShareOpen(true);
        // Clean up URL params
        router.replace(`/dashboard/badge/${params.id}`, { scroll: false });
      }
    }
  }, [badge, searchParams, params.id, router, isClient]);

  useEffect(() => {
    if (isShareOpen) {
      fetchShareLinks();
    }
  }, [isShareOpen]);

  if (!badge) {
    notFound();
  }
  
  const creator = getUserById(badge.ownerId);
  const owners = badge.owners.map(id => getUserById(id)).filter(Boolean) as User[];
  const followers = badge.followers.map(id => getUserById(id)).filter(Boolean) as User[];
  const badgesLeft = badge.tokens - owners.length;

  const handleFollow = () => {
    followBadge(badge.id, currentUserId);
    setIsFollowing(!isFollowing);
    toast({
        title: !isFollowing ? 'Followed!' : 'Unfollowed.',
        description: `You are now ${!isFollowing ? 'following' : 'no longer following'} "${badge.name}".`
    });
    forceUpdate();
  }
  
  return (
    <>
      <Header title="Badge Details" />
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-6xl mb-4">{badge.emojis}</div>
                    <CardTitle className="font-headline text-3xl">{badge.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                       Created by
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={creator?.avatarUrl} alt={creator?.name} />
                        <AvatarFallback>{creator?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {creator?.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {isClient && (
                      <>
                        <p className="text-3xl font-bold text-primary">{badgesLeft.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Badges Left</p>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        onClick={() => setShareOpen(true)} 
                        className={cn({ 'invisible': !isClient || !isOwner })}
                        disabled={!isOwner || badgesLeft <= 0}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTransferOpen(true)}
                    className={cn({ 'invisible': !isClient || !isCreator })}
                    disabled={!isCreator}
                  >
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transfer
                  </Button>
                   <Button 
                     variant={isFollowing ? 'secondary' : 'outline'} 
                     onClick={handleFollow}
                     className={cn({ 'invisible': !isClient })}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                   </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Crown className="h-6 w-6" />
                        Owners ({owners.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {owners.map((user) => (
                        <div key={user.id} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{user.name}</p>
                        {user.id === badge.ownerId && <span className="text-xs text-muted-foreground">(Creator)</span>}
                        </div>
                    ))}
                    {owners.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No one owns this badge yet.</p>
                    )}
                    </div>
                </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Followers ({followers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  ))}
                  {followers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ShareBadgeDialog 
        open={isShareOpen} 
        onOpenChange={setShareOpen} 
        badge={badge} 
        links={shareLinks}
        onGenerateNewLinks={generateNewShareLinks}
      />
      <TransferBadgeDialog open={isTransferOpen} onOpenChange={setTransferOpen} badge={badge} onTransfer={forceUpdate} />
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
