'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';
import { badgesAtom, currentUserIdAtom, shareLinksAtom } from '@/lib/mock-data';

export default function RedeemCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentUserId] = useAtom(currentUserIdAtom);
  const [shareLinks, setShareLinks] = useAtom(shareLinksAtom);
  const [badges, setBadges] = useAtom(badgesAtom);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUserId) {
        toast({ title: 'Error', description: 'You must be logged in to redeem a code.', variant: 'destructive'});
        return;
    }
    if (!code.trim()) {
      toast({
        title: 'Missing Code',
        description: 'Please enter a badge code to redeem.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
        try {
            const link = shareLinks[code];

            if (!link || link.used) {
                throw new Error("This code is invalid or has already been used.");
            }
            
            const badgeToClaim = badges[link.badgeId];
            if (!badgeToClaim) {
                throw new Error("The badge for this code could not be found.");
            }
            if(badgeToClaim.owners.includes(currentUserId)){
                throw new Error(`You already own the "${badgeToClaim.name}" badge.`);
            }

            // Mark link as used
            setShareLinks(prev => ({ ...prev, [code]: { ...prev[code], used: true, claimedBy: currentUserId }}));
            
            // Add user to badge owners
            setBadges(prev => ({
                ...prev,
                [link.badgeId]: {
                    ...prev[link.badgeId],
                    owners: [...prev[link.badgeId].owners, currentUserId],
                    followers: [...new Set([...prev[link.badgeId].followers, currentUserId])],
                }
            }));
            
            toast({
                title: 'Badge Claimed!',
                description: `You are now an owner of the "${badgeToClaim.name}" badge.`,
            });

            router.push(`/dashboard/badge/${link.badgeId}?showShare=true`);

        } catch (error: any) {
            toast({
                title: 'Redemption Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setCode('');
        }
    }, 1000);
  };

  return (
    <>
      <Header title="Redeem a Badge Code" />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Redeem Badge
            </CardTitle>
            <CardDescription>
              Enter a secret code you received to claim a badge and become an owner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Secret Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Paste your secret code here"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="font-mono"
                />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !currentUserId}>
                {isLoading ? 'Redeeming...' : 'Redeem Badge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
