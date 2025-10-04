
'use client';

import { useState, useEffect } from 'react';
import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getShareLink, claimBadge, getBadgeById, type Badge, type ShareLink } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';


export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<ShareLink[]>([]);
  const currentUserId = 'user-1'; // Hardcoded user for now

  useEffect(() => {
    const link = getShareLink(params.linkId);
    if (!link || link.used) {
      setError("This invitation code is invalid or has already been used.");
      setIsLoading(false);
      return;
    }

    const linkedBadge = getBadgeById(link.badgeId);
    if (!linkedBadge) {
      setError("The badge associated with this code could not be found.");
      setIsLoading(false);
      return;
    }
    
    if(linkedBadge.owners.length >= linkedBadge.tokens) {
        setError("All available badges have been claimed.");
        setIsLoading(false);
        return;
    }
    
    if(linkedBadge.owners.includes(currentUserId)) {
        setError("You already own this badge.");
        setIsLoading(false);
        return;
    }

    setBadge(linkedBadge);
    setIsLoading(false);
  }, [params.linkId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge) return;

    try {
        const { newLinks } = claimBadge(badge.id, currentUserId, params.linkId);
        
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });

        if (newLinks.length > 0) {
            setNewShareLinks(newLinks);
            setShareOpen(true); // Open the dialog to show the new link
        } else {
             // If no new links, just go to the badge page
            router.push(`/dashboard/badge/${badge.id}`);
        }
        
    } catch(err: any) {
         toast({
            title: 'Failed to Claim Badge',
            description: err.message,
            variant: 'destructive',
        });
        setError(err.message);
    }
  };

  const handleShareDialogClose = () => {
    setShareOpen(false);
    // After closing the share dialog, navigate to the badge page
    if (badge) {
        router.push(`/dashboard/badge/${badge.id}`);
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center space-y-4">
            <div className="mb-4 flex justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      )
    }

    if (error || !badge) {
        return (
            <div className="text-center">
                <div className="mb-4 flex justify-center">
                    <EmojiBadgeLogo className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-headline">Claim Failed</CardTitle>
                <CardDescription>
                    {error || "An unknown error occurred."}
                </CardDescription>
            </div>
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
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Claim Badge
                    </Button>
                </form>
            </CardContent>
        </>
    )
  }


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
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
