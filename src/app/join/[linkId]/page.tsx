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
import { useUser } from '@/firebase';

export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<ShareLink[]>([]);
  
  useEffect(() => {
    if (userLoading) return; // Wait for user state to be resolved

    const initialize = async () => {
        const link = await getShareLink(params.linkId);
        if (!link || link.used) {
            setError("This invitation code is invalid or has already been used.");
            setIsLoading(false);
            return;
        }

        const linkedBadge = await getBadgeById(link.badgeId);
        if (!linkedBadge) {
            setError("The badge associated with this code could not be found.");
            setIsLoading(false);
            return;
        }

        if (user) {
            if (link.ownerId === user.uid) {
                setError("You cannot claim a badge using a code you generated yourself.");
                setIsLoading(false);
                return;
            }
            if(linkedBadge.owners.includes(user.uid)) {
                toast({
                    title: 'Already an Owner',
                    description: `You already own the "${linkedBadge.name}" badge.`,
                });
                router.replace(`/dashboard/badge/${linkedBadge.id}`);
                return;
            }
        }
        
        if(linkedBadge.owners.length >= linkedBadge.tokens) {
            setError("All available badges have been claimed.");
            setIsLoading(false);
            return;
        }

        setBadge(linkedBadge);
        setIsLoading(false);
    }
    initialize();

  }, [params.linkId, router, toast, user, userLoading]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge || !user) {
        if (!user) router.push(`/login?redirect=/join/${params.linkId}`);
        return
    };

    setIsClaiming(true);

    try {
        const { newLinks } = await claimBadge(badge.id, user.uid, params.linkId);
        
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });

        if (newLinks.length > 0) {
            setNewShareLinks(newLinks);
            setShareOpen(true);
        } else {
            router.push(`/dashboard/badge/${badge.id}`);
        }
        
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
    if (isLoading || userLoading) {
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

    return (
        <>
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="text-6xl">{badge.emojis}</div>
                </div>
                <CardTitle className="text-2xl font-headline">Claim '{badge.name}'</CardTitle>
                <CardDescription>
                    {user ? "You've been invited to own this badge! Click below to claim it." : "Log in or sign up to claim this badge."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleJoin} className="grid gap-4">
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isClaiming}>
                     {isClaiming ? "Claiming..." : (user ? "Claim Badge" : "Login to Claim")}
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
