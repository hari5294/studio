
'use client';

import { useState, useEffect, useMemo } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useAuth, useDoc, useFirestore } from '@/firebase';
import { Badge, ShareLink } from '@/lib/mock-data';
import { doc, getDoc, runTransaction, collection } from 'firebase/firestore';

const EXPIRY_HOURS = 24;

export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const firestore = useFirestore();

  const [badge, setBadge] = useState<Badge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<ShareLink[]>([]);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);
  
  const linkId = params.linkId;

  const linkRef = useMemo(() => firestore ? doc(firestore, 'shareLinks', linkId) : null, [firestore, linkId]);
  const { data: shareLink, loading: linkLoading } = useDoc<ShareLink>(linkRef);

  useEffect(() => {
    if (linkLoading || !shareLink || !firestore) {
        if(!linkLoading) setIsLoading(false);
        return;
    }
    
    const initialize = async () => {
        const now = Date.now();
        const expiryTime = shareLink.createdAt + (EXPIRY_HOURS * 60 * 60 * 1000);

        if (shareLink.used) {
            setError("This invitation code is invalid or has already been used.");
            setIsLoading(false);
            return;
        }

        if (now > expiryTime) {
            setError(`This code has expired. Codes are valid for ${EXPIRY_HOURS} hours.`);
            setIsLoading(false);
            return;
        }

        const badgeRef = doc(firestore, 'badges', shareLink.badgeId);
        const badgeDoc = await getDoc(badgeRef);

        if (!badgeDoc.exists()) {
            setError("The badge associated with this code could not be found.");
            setIsLoading(false);
            return;
        }
        const linkedBadge = { id: badgeDoc.id, ...badgeDoc.data() } as Badge;

        if (currentUser) {
            const ownerRef = doc(firestore, `badges/${linkedBadge.id}/owners`, currentUser.id);
            const ownerDoc = await getDoc(ownerRef);
            if (ownerDoc.exists()) {
                 setError(`You already own the "${linkedBadge.name}" badge.`);
                 setIsLoading(false);
                 return;
            }
        }
        
        setBadge(linkedBadge);
        setIsLoading(false);
    }
    initialize();

  }, [linkId, shareLink, linkLoading, firestore, currentUser]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge || !currentUser || !firestore || !shareLink) return;

    setIsClaiming(true);

    try {
        const generatedLinks: ShareLink[] = [];
        await runTransaction(firestore, async (transaction) => {
             // Update link
            transaction.update(linkRef, { used: true, claimedBy: currentUser.id });

            // Update badge owners and followers
            const ownerRef = doc(firestore, `badges/${badge.id}/owners`, currentUser.id);
            transaction.set(ownerRef, { userId: currentUser.id, badgeId: badge.id, claimedAt: Date.now() });

            const followerRef = doc(firestore, `badges/${badge.id}/followers`, currentUser.id);
            transaction.set(followerRef, { userId: currentUser.id, badgeId: badge.id, followedAt: Date.now() }, { merge: true });

            // Create 3 new share links for the new owner
            for (let i = 0; i < 3; i++) {
                const newLinkRef = doc(collection(firestore, 'shareLinks'));
                const newLinkData = { badgeId: badge.id, ownerId: currentUser.id, used: false, claimedBy: null, createdAt: Date.now() };
                transaction.set(newLinkRef, newLinkData);
                generatedLinks.push({ linkId: newLinkRef.id, ...newLinkData });
            }
        });

        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });
        
        setBurstEmojis(badge.emojis);
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
                    {error || "This link is invalid or expired."}
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
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isClaiming || !currentUser}>
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
