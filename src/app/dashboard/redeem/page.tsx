
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Gift } from 'lucide-react';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useMockData } from '@/hooks/use-mock-data';

export default function RedeemCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { redeemShareLink } = useMockData();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

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
        const { badge } = redeemShareLink(code.trim(), user.id);
        toast({
            title: 'Badge Claimed!',
            description: `You are now an owner of the "${badge.name}" badge.`,
        });
        
        setBurstEmojis(badge.emojis);

        setTimeout(() => handleRedeemComplete(badge.id), 2000);

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
