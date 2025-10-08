
'use client';

import { useState, useEffect } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, firestore } from '@/firebase';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { getDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { ShareLink, Badge } from '@/docs/backend-schema';
import { AppUser } from '@/firebase/auth/use-user';


async function redeemShareLink(linkId: string, userId: string): Promise<{ badge: Badge & { id: string }}> {
    const linkRef = doc(firestore, 'shareLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists() || linkSnap.data().used) {
        throw new Error("This code is invalid or has already been used.");
    }
    
    const linkData = linkSnap.data();
    const badgeId = linkData.badgeId;

    const batch = writeBatch(firestore);
    
    // Mark link as used
    batch.update(linkRef, {
        used: true,
        claimedBy: userId,
    });
    
    // Add new owner
    const ownerRef = doc(firestore, `badges/${badgeId}/owners`, userId);
    batch.set(ownerRef, {
        badgeId: badgeId,
        userId: userId,
        claimedAt: serverTimestamp()
    });

    await batch.commit();

    const badgeRef = doc(firestore, 'badges', badgeId);
    const badgeSnap = await getDoc(badgeRef);
    if (!badgeSnap.exists()) {
        throw new Error("Could not find the claimed badge.");
    }
    const badge = { id: badgeSnap.id, ...badgeSnap.data() } as Badge & { id: string };

    return { badge };
}

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  
  const linkId = params.linkId as string;
  const [link, setLink] = useState<ShareLink & {id: string} | null>(null);
  const [badge, setBadge] = useState<Badge & {id: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) return;

    const fetchLinkData = async () => {
        setIsLoading(true);
        const linkRef = doc(firestore, 'shareLinks', linkId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
            setError("This invitation code is invalid or has already been used.");
            setIsLoading(false);
            return;
        }

        const linkData = {id: linkSnap.id, ...linkSnap.data()} as ShareLink & { id: string };
        setLink(linkData);

        if (linkData.used) {
            const claimedByUser = currentUser?.uid === linkData.claimedBy;
            const message = claimedByUser 
                ? "You have already claimed this badge."
                : "This invitation code has already been used by someone else.";
            setError(message);
            setIsLoading(false);
            return;
        }
        
        const badgeRef = doc(firestore, 'badges', linkData.badgeId);
        const badgeSnap = await getDoc(badgeRef);

        if (!badgeSnap.exists()) {
            setError("The badge associated with this code could not be found.");
        } else {
            setBadge({id: badgeSnap.id, ...badgeSnap.data()} as Badge & { id: string });
        }
        
        setIsLoading(false);
    };

    fetchLinkData();

  }, [linkId, currentUser]);


  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !badge || !currentUser) return;

    setIsClaiming(true);
    try {
        await redeemShareLink(link.id, currentUser.uid);
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });
        
        setBurstEmojis(badge.emojis);

        setTimeout(() => {
            setShareOpen(true);
        }, 1500);
            
    } catch(err: any) {
         toast({
            title: 'Failed to Claim Badge',
            description: err.message,
            variant: 'destructive',
        });
        setError(err.message);
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
      {badge && currentUser && (
          <ShareBadgeDialog 
            open={isShareOpen} 
            onOpenChange={handleShareDialogClose} 
            badge={badge}
            user={currentUser as AppUser}
          />
      )}
    </div>
  );
}

    