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
import { ArrowLeft, Smile } from 'lucide-react';
import { isOnlyEmojis } from '@/lib/utils';
import { badgesAtom, currentUserIdAtom, shareLinksAtom, ShareLink, Badge } from '@/lib/mock-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useSound } from '@/components/providers/sound-provider';

export default function CreateBadgePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [emojis, setEmojis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId] = useAtom(currentUserIdAtom);
  const [, setBadges] = useAtom(badgesAtom);
  const [, setShareLinks] = useAtom(shareLinksAtom);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const emojiArray = [...value];
    if (value === '' || (isOnlyEmojis(value) && emojiArray.length <= 3)) {
      setEmojis(value);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setEmojis(prev => {
        const currentEmojis = [...prev];
        if (currentEmojis.length < 3) {
            return prev + emojiData.emoji;
        }
        return prev;
    });
  }

  const handleAnimationComplete = (newBadgeId: string) => {
    const url = `/dashboard/badge/${newBadgeId}?showShare=true`;
    router.push(url);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUserId) {
        toast({ title: 'Error', description: 'You must be logged in to create a badge.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const badgeName = formData.get('badgeName') as string;
    const submittedEmojis = formData.get('emojis') as string;
    const tokens = Number(formData.get('tokens'));
    
    const emojiCount = [...submittedEmojis].length;
    if (emojiCount !== 3) {
        toast({
            title: 'Invalid Emoji Count',
            description: 'Please use exactly 3 emojis.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!badgeName || !submittedEmojis || !tokens) {
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
            const newBadgeId = crypto.randomUUID();
            const newBadge: Badge = {
                id: newBadgeId,
                name: badgeName,
                emojis: submittedEmojis,
                tokens: tokens,
                creatorId: currentUserId,
                owners: [currentUserId],
                followers: [currentUserId],
                createdAt: Date.now(),
            };
            
            setBadges(prev => ({ ...prev, [newBadgeId]: newBadge }));
            
            setShareLinks(prev => {
              const newLinks: Record<string, ShareLink> = {};
              for (let i = 0; i < 3; i++) {
                const newLinkId = crypto.randomUUID();
                newLinks[newLinkId] = {
                  linkId: newLinkId,
                  badgeId: newBadgeId,
                  ownerId: currentUserId,
                  used: false,
                  claimedBy: null,
                  createdAt: Date.now(),
                };
              }
              return { ...prev, ...newLinks };
            });

            toast({
                title: 'Badge Created!',
                description: `Your badge "${badgeName}" has been successfully created.`,
            });
            
            playSound('claim');
            setBurstEmojis(submittedEmojis);

            setTimeout(() => handleAnimationComplete(newBadgeId), 2000); // Wait for burst to finish

        } catch (error: any) {
            toast({
                title: 'Creation Failed',
                description: error.message,
                variant: 'destructive',
            });
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
            <CardDescription>Design your unique badge with a name and exactly 3 emojis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="badge-name">Badge Name</Label>
                <Input id="badge-name" name="badgeName" placeholder="e.g., Cosmic Explorers" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emojis">Emojis</Label>
                <div className="flex gap-2">
                  <Input 
                    id="emojis" 
                    name="emojis" 
                    placeholder="🚀✨🪐" 
                    required 
                    value={emojis}
                    onChange={handleEmojiChange}
                    disabled={isLoading}
                    className="flex-grow"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" type="button" disabled={isLoading}>
                            <Smile />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose exactly 3 emojis that represent your badge.
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
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
    </>
  );
}
