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

// Mock Data
const mockBadges = {
    'b1': { id: 'b1', name: 'Cosmic Explorer', emojis: '🚀✨', tokens: 1000 },
};
const mockLinks = {
    'link123': { linkId: 'link123', badgeId: 'b1', ownerId: 'user456', used: false },
    'usedlink': { linkId: 'usedlink', badgeId: 'b1', ownerId: 'user456', used: true },
};

export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [badge, setBadge] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [newShareLinks, setNewShareLinks] = useState<any[]>([]);
  const [user, setUser] = useState<{uid: string} | null>({uid: 'user123'}); // Mocked user

  useEffect(() => {
    const initialize = () => {
        const link = mockLinks[params.linkId as keyof typeof mockLinks];
        if (!link || link.used) {
            setError("This invitation code is invalid or has already been used.");
            setIsLoading(false);
            return;
        }

        const linkedBadge = mockBadges[link.badgeId as keyof typeof mockBadges];
        if (!linkedBadge) {
            setError("The badge associated with this code could not be found.");
            setIsLoading(false);
            return;
        }
        
        setBadge(linkedBadge);
        setIsLoading(false);
    }
    setTimeout(initialize, 500);

  }, [params.linkId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge || !user) return;

    setIsClaiming(true);

    setTimeout(() => {
        try {
            toast({
                title: 'Badge Claimed!',
                description: `You are now an owner of the "${badge.name}" badge.`,
            });

            // Mock creating new links
            const newLinks = [{ linkId: 'new-mock-link', badgeId: badge.id, ownerId: user.uid, used: false }];
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
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isClaiming}>
                     {isClaiming ? "Claiming..." : "Claim Badge"}
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
