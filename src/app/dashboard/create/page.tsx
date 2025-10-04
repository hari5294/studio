
'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { createBadge } from '@/lib/data';

export default function CreateBadgePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const badgeName = formData.get('badgeName') as string;
    const emojis = formData.get('emojis') as string;
    const tokens = Number(formData.get('tokens'));

    if (!badgeName || !emojis || !tokens) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all fields.',
            variant: 'destructive',
        });
        return;
    }
    
    try {
        const { newBadge, initialLinks } = createBadge({ name: badgeName, emojis, tokens }, 'user-1');

        toast({
        title: 'Badge Created!',
        description: `Your badge "${badgeName}" has been successfully created.`,
        });
        
        const url = initialLinks.length > 0 ? `/dashboard/badge/${newBadge.id}?showShare=true` : `/dashboard/badge/${newBadge.id}`;
        
        // Redirect to the badge page and trigger the share dialog
        router.push(url);
    } catch (error: any) {
        toast({
            title: 'Creation Failed',
            description: error.message,
            variant: 'destructive',
        });
    }
  };

  return (
    <>
      <Header title="Create a New Badge" />
      <div className="flex-1 p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Badge Details</CardTitle>
            <CardDescription>Design your unique badge with emojis and a name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="badge-name">Badge Name</Label>
                <Input id="badge-name" name="badgeName" placeholder="e.g., Cosmic Explorers" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emojis">Emojis</Label>
                <Input id="emojis" name="emojis" placeholder="🚀✨🪐" required />
                <p className="text-sm text-muted-foreground">
                  Choose up to 3 emojis that represent your badge.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokens">Token Amount</Label>
                <Input id="tokens" name="tokens" type="number" placeholder="1000" required min="1"/>
                 <p className="text-sm text-muted-foreground">
                  Initial amount of badges available to claim.
                </p>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Create Badge
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
