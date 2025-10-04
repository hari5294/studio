
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';
import { getShareLink, claimBadge, getBadgeById } from '@/lib/firestore-data';
import { useUser } from '@/firebase';

export default function RedeemCodePage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ title: "Not authenticated", description: "You must be logged in to redeem a code.", variant: "destructive" });
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

    try {
      const link = await getShareLink(code);
      if (!link || link.used) {
        throw new Error("This code is invalid or has already been used.");
      }

      const badge = await getBadgeById(link.badgeId);
      if (!badge) {
        throw new Error("The badge associated with this code could not be found.");
      }
      
      if (link.ownerId === user.uid) {
        throw new Error("You cannot redeem a code that you generated yourself.");
      }

      if (badge.owners.length >= badge.tokens) {
        throw new Error("All available badges have been claimed.");
      }

      if (badge.owners.includes(user.uid)) {
        toast({
            title: 'Already an Owner',
            description: `You already own the "${badge.name}" badge.`,
            variant: 'default',
        });
        router.push(`/dashboard/badge/${badge.id}`);
        return;
      }

      const { newLinks } = await claimBadge(badge.id, user.uid, code);

      toast({
        title: 'Badge Claimed!',
        description: `You are now an owner of the "${badge.name}" badge.`,
      });

      const url = newLinks.length > 0
        ? `/dashboard/badge/${badge.id}?showShare=true`
        : `/dashboard/badge/${badge.id}`;
      router.push(url);

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
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? 'Redeeming...' : 'Redeem Badge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
