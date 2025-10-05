
'use client';

import { useState, useEffect } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useMockData } from '@/hooks/use-mock-data';
import type { ShareLink, Badge } from '@/lib/mock-data';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { shareLinks, badges, redeemShareLink } = useMockData();
  
  const linkId = params.linkId as string;
  const [link, setLink] = useState<ShareLink | undefined>(undefined);
  const [badge, setBadge] = useState<Badge | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const foundLink = shareLinks.find(l => l.id === linkId);
    setLink(foundLink);

    if (!foundLink) {
        setError("This invitation code is invalid or has already been used.");
        setIsLoading(false);
        return;
    }

    if (foundLink.used) {
        const claimedByUser = currentUser?.id === foundLink.claimedBy;
        const message = claimedByUser 
            ? "You have already claimed this badge."
            : "This invitation code has already been used by someone else.";
        setError(message);
        setIsLoading(false);
        return;
    }
    
    const foundBadge = badges.find(b => b.id === foundLink.badgeId);
    setBadge(foundBadge);

    if (!foundBadge) {
        setError("The badge associated with this code could not be found.");
    }
    
    setIsLoading(false);

  }, [linkId, shareLinks, badges, currentUser]);


  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !badge || !currentUser) return;

    setIsClaiming(true);
    try {
        redeemShareLink(link.id, currentUser.id);
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
            user={currentUser}
          />
      )}
    </div>
  );
}
