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
import { ArrowLeft } from 'lucide-react';
import { isOnlyEmojis } from '@/lib/utils';
import { badgesAtom, currentUserIdAtom, shareLinksAtom } from '@/lib/mock-data';

export default function CreateBadgePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [emojis, setEmojis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId] = useAtom(currentUserIdAtom);
  const [, setBadges] = useAtom(badgesAtom);
  const [, setShareLinks] = useAtom(shareLinksAtom);

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || isOnlyEmojis(value)) {
      setEmojis(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUserId) {
        toast({ title: 'Error', description: 'You must be logged in to create a badge.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const badgeName = formData.get('badgeName') as string;
    const tokens = Number(formData.get('tokens'));

    if (!badgeName || !emojis || !tokens) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all fields.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }
    
    // Mock API call
    setTimeout(() => {
        try {
            const newBadgeId = `badge${Date.now()}`;
            
            setBadges(prev => ({
                ...prev,
                [newBadgeId]: {
                    id: newBadgeId,
                    name: badgeName,
                    emojis: emojis,
                    tokens: tokens,
                    creatorId: currentUserId,
                    owners: [currentUserId],
                    followers: [currentUserId],
                    createdAt: Date.now(),
                }
            }));
            
            // Create a share link for the creator
            const newLinkId = `link${Date.now()}`;
            setShareLinks(prev => ({
              ...prev,
              [newLinkId]: {
                linkId: newLinkId,
                badgeId: newBadgeId,
                ownerId: currentUserId,
                used: false,
                claimedBy: null,
              },
            }));

            toast({
                title: 'Badge Created!',
                description: `Your badge "${badgeName}" has been successfully created.`,
            });
            
            const url = `/dashboard/badge/${newBadgeId}?showShare=true`;
            router.push(url);

        } catch (error: any) {
            toast({
                title: 'Creation Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <>
      <Header title="Create a New Badge" />
      <div className="flex-1 p-4 md:p-6">
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
                <Input id="badge-name" name="badgeName" placeholder="e.g., Cosmic Explorers" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emojis">Emojis</Label>
                <Input 
                  id="emojis" 
                  name="emojis" 
                  placeholder="🚀✨🪐" 
                  required 
                  value={emojis}
                  onChange={handleEmojiChange}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Choose up to 3 emojis that represent your badge. Only emojis are allowed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokens">Token Amount</Label>
                <Input id="tokens" name="tokens" type="number" placeholder="1000" required min="1" disabled={isLoading}/>
                 <p className="text-sm text-muted-foreground">
                  Initial amount of badges available to claim.
                </p>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !currentUserId}>
                {isLoading ? 'Creating...' : 'Create Badge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
