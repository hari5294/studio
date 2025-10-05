
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
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useAuth, useDoc, useFirestore } from '@/firebase';
import { doc, writeBatch, collection, getDoc, runTransaction } from 'firebase/firestore';
import { Badge, ShareLink } from '@/lib/mock-data';

const EXPIRY_HOURS = 24;

export default function RedeemCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  const handleRedeemComplete = (badgeId: string) => {
    router.push(`/dashboard/badge/${badgeId}?showShare=true`);
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) {
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

    try {
        await runTransaction(firestore, async (transaction) => {
            const linkRef = doc(firestore, 'shareLinks', code);
            const linkDoc = await transaction.get(linkRef);

            if (!linkDoc.exists()) {
                throw new Error("This code is invalid or has already been used.");
            }

            const link = linkDoc.data() as ShareLink;
            const now = Date.now();
            const expiryTime = link.createdAt + (EXPIRY_HOURS * 60 * 60 * 1000);

            if (link.used) {
                throw new Error("This code is invalid or has already been used.");
            }
             if (now > expiryTime) {
                throw new Error(`This code has expired. Codes are valid for ${EXPIRY_HOURS} hours.`);
            }
            
            const badgeRef = doc(firestore, 'badges', link.badgeId);
            const badgeDoc = await transaction.get(badgeRef);
            if (!badgeDoc.exists()) {
                throw new Error("The badge for this code could not be found.");
            }
            const badgeToClaim = badgeDoc.data() as Badge;
            
            const ownerRef = doc(firestore, 'badges', link.badgeId, 'owners', user.id);
            const ownerDoc = await transaction.get(ownerRef);
            if(ownerDoc.exists()){
                throw new Error(`You already own the "${badgeToClaim.name}" badge.`);
            }

            // Mark link as used
            transaction.update(linkRef, { used: true, claimedBy: user.id });
            
            // Add user to badge owners
            transaction.set(ownerRef, { userId: user.id, badgeId: link.badgeId, claimedAt: Date.now() });

            // Add user to followers if not already
            const followerRef = doc(firestore, 'badges', link.badgeId, 'followers', user.id);
            transaction.set(followerRef, { userId: user.id, badgeId: link.badgeId, followedAt: Date.now() }, { merge: true });

            // Create 3 new share links for the new owner
            for (let i = 0; i < 3; i++) {
                const newLinkRef = doc(collection(firestore, 'shareLinks'));
                const newLink: Omit<ShareLink, 'linkId'> = { badgeId: link.badgeId, ownerId: user.id, used: false, claimedBy: null, createdAt: Date.now() };
                transaction.set(newLinkRef, newLink);
            }

            // Show UI feedback after transaction
            toast({
                title: 'Badge Claimed!',
                description: `You are now an owner of the "${badgeToClaim.name}" badge.`,
            });
            
            setBurstEmojis(badgeToClaim.emojis);
            setTimeout(() => handleRedeemComplete(link.badgeId), 2000);
        });

    } catch (error: any) {
        toast({
            title: 'Redemption Failed',
            description: error.message,
            variant: 'destructive',
        });
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
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !user}>
                {isLoading ? 'Redeeming...' : 'Redeem Badge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
       {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
    </>
  );
}
