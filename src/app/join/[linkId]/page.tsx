
'use client';

import { useState, useEffect } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMockData, ShareLink } from '@/lib/mock-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { EmojiBurst } from '@/components/effects/emoji-burst';


export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const {
    badges,
    shareLinks,
    users,
    redeemShareLink,
    createShareLink,
    loading,
  } = useMockData();
  
  const linkId = params.linkId;
  const [shareLink, setShareLink] = useState<ShareLink | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<ShareLink[]>([]);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);
  

  useEffect(() => {
    const link = shareLinks.find(l => l.id === linkId);
    setShareLink(link);

    if (!link || link.used) {
        setError("This invitation code is invalid or has already been used.");
        setIsLoading(false);
        return;
    }
    
    const linkedBadge = badges.find(b => b.id === link.badgeId);
    if (!linkedBadge) {
        setError("The badge associated with this code could not be found.");
        setIsLoading(false);
        return;
    }

    if (currentUser && linkedBadge.owners.includes(currentUser.id)) {
        setError(`You already own the "${linkedBadge.name}" badge.`);
        setIsLoading(false);
        return;
    }
    
    setIsLoading(false);

  }, [linkId, shareLinks, badges, currentUser]);

  const badge = badges.find(b => b.id === shareLink?.badgeId);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge || !currentUser) return;

    setIsClaiming(true);
    try {
        redeemShareLink(linkId, currentUser.id);
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });
        
        // Create new links for sharing
        const newLinks: ShareLink[] = [];
        for (let i = 0; i < 3; i++) {
           const newLink = createShareLink({badgeId: badge.id, ownerId: currentUser.id});
           newLinks.push(newLink);
        }
        setNewShareLinks(newLinks);
        
        setBurstEmojis(badge.emojis);

        setTimeout(() => {
            setShareOpen(true);
        }, 1500)
            
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
    if (isLoading || loading) {
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
            createShareLink={createShareLink}
            links={newShareLinks}
          />
      )}
    </div>
  );
}
