
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, firestore } from '@/firebase';
import { Gift } from 'lucide-react';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { getDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Badge } from '@/docs/backend-schema';

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


export default function RedeemCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  useEffect(() => {
    const codeFromQuery = searchParams.get('code');
    if (codeFromQuery) {
        setCode(codeFromQuery);
    }
  }, [searchParams]);

  const handleRedeemComplete = (badgeId: string) => {
    router.push(`/dashboard/badge/${badgeId}`);
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
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
        const { badge } = await redeemShareLink(code.trim(), user.uid);
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });
        
        setBurstEmojis(badge.emojis);

        setTimeout(() => handleRedeemComplete(badge.id), 1500);

    } catch (error: any) {
        toast({
            title: 'Redemption Failed',
            description: error.message || "The code is invalid or has already been used.",
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
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !user || !!burstEmojis}>
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
