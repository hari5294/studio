
'use client';

import { useState, useEffect } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { useAtom } from 'jotai';
import { shareLinksAtom, badgesAtom, currentUserIdAtom, ShareLink, Badge } from '@/lib/mock-data';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useSound } from '@/components/providers/sound-provider';

const EXPIRY_HOURS = 24;

export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();

  const [shareLinks, setShareLinks] = useAtom(shareLinksAtom);
  const [badges, setBadges] = useAtom(badgesAtom);
  const [currentUserId] = useAtom(currentUserIdAtom);

  const [badge, setBadge] = useState<Badge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<ShareLink[]>([]);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);
  
  const linkId = params.linkId;

  useEffect(() => {
    const initialize = () => {
        const link = shareLinks[linkId];
        const now = Date.now();
        const expiryTime = (link?.createdAt || 0) + (EXPIRY_HOURS * 60 * 60 * 1000);

        if (!link || link.used) {
            setError("This invitation code is invalid or has already been used.");
            setIsLoading(false);
            return;
        }

        if (now > expiryTime) {
            setError(`This code has expired. Codes are valid for ${EXPIRY_HOURS} hours.`);
            setIsLoading(false);
            return;
        }

        const linkedBadge = badges[link.badgeId];
        if (!linkedBadge) {
            setError("The badge associated with this code could not be found.");
            setIsLoading(false);
            return;
        }
        
        if (linkedBadge.owners.includes(currentUserId)) {
             setError(`You already own the "${linkedBadge.name}" badge.`);
             setIsLoading(false);
             return;
        }
        
        setBadge(linkedBadge);
        setIsLoading(false);
    }
    setTimeout(initialize, 500);

  }, [linkId, shareLinks, badges, currentUserId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge || !currentUserId) return;

    setIsClaiming(true);

    setTimeout(() => {
        try {
            // Update link
            setShareLinks(prev => ({
                ...prev,
                [linkId]: { ...prev[linkId], used: true, claimedBy: currentUserId }
            }));

            // Update badge owners and followers
            setBadges(prev => ({
                ...prev,
                [badge.id]: {
                    ...prev[badge.id],
                    owners: [...prev[badge.id].owners, currentUserId],
                    followers: [...new Set([...prev[badge.id].followers, currentUserId])]
                }
            }));

            toast({
                title: 'Badge Claimed!',
                description: `You are now an owner of the "${badge.name}" badge.`,
            });
            
            playSound('claim');
            setBurstEmojis(badge.emojis);

            // Create 3 new share links for the new owner
            const generatedLinks: ShareLink[] = [];
            setShareLinks(prev => {
              const newLinksToAdd: Record<string, ShareLink> = {};
              for (let i = 0; i < 3; i++) {
                const newLinkId = crypto.randomUUID();
                const newLink: ShareLink = { linkId: newLinkId, badgeId: badge.id, ownerId: currentUserId, used: false, claimedBy: null, createdAt: Date.now() };
                newLinksToAdd[newLinkId] = newLink;
                generatedLinks.push(newLink);
              }
              return { ...prev, ...newLinksToAdd };
            });

            setNewShareLinks(generatedLinks);
            
            setTimeout(() => setShareOpen(true), 1500);
            
        } catch(err: any) {
             toast({
                title: 'Failed to Claim Badge',
                description: err.message,
                variant: 'destructive',
            });
            setError(err.message);
        } finally {
            setIsClaiming(false);
        }
    }, 1000);
  };

  const handleShareDialogClose = () => {
    setShareOpen(false);
    if (badge) {
        router.push(`/dashboard/badge/${badge.id}`);
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center space-y-4 pt-6">
            <div className="mb-4 flex justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="pt-4">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
      )
    }

    if (error || !badge) {
        return (
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <EmojiBadgeLogo className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-headline">Claim Failed</CardTitle>
                <CardDescription>
                    {error || "An unknown error occurred."}
                </CardDescription>
            </CardHeader>
        )
    }

    if (burstEmojis) {
      return (
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-6xl">{badge.emojis}</div>
          </div>
          <CardTitle className="text-2xl font-headline">Success!</CardTitle>
          <CardDescription>
              You've claimed the "{badge.name}" badge.
          </CardDescription>
        </CardHeader>
      )
    }

    return (
        <>
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="text-6xl">{badge.emojis}</div>
                </div>
                <CardTitle className="text-2xl font-headline">Claim '{badge.name}'</CardTitle>
                <CardDescription>
                    You've been invited to own this badge! Click below to claim it.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleJoin} className="grid gap-4">
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isClaiming || !currentUserId}>
                     {isClaiming ? "Claiming..." : "Claim Badge"}
                    </Button>
                </form>
            </CardContent>
        </>
    )
  }


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative">
       {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
      <Card className="mx-auto w-full max-w-sm">
        {renderContent()}
         <CardContent>
            <div className="mt-4 text-center text-sm">
                <Link href="/dashboard" className="underline">
                Go to Dashboard
                </Link>
            </div>
         </CardContent>
      </Card>
      {badge && (
          <ShareBadgeDialog 
            open={isShareOpen} 
            onOpenChange={handleShareDialogClose} 
            badge={badge}
            links={newShareLinks}
          />
      )}
    </div>
  );
}

    
