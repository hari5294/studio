
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Smile } from 'lucide-react';
import { useUser, firestore } from '@/firebase';
import { isOnlyEmojis } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';

// Regex to match emojis, including those with skin tones and zero-width joiners
const EMOJI_REGEX = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gus;

const countEmojis = (text: string) => {
  return text.match(EMOJI_REGEX)?.length ?? 0;
};

export default function CreateBadgePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [emojis, setEmojis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || (isOnlyEmojis(value) && countEmojis(value) <= 3)) {
      setEmojis(value);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setEmojis(prev => {
        if (countEmojis(prev) < 3) {
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
    if (!user) return;

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('badgeName') as string;
    const submittedEmojis = formData.get('emojis') as string;
    const tokens = Number(formData.get('tokens'));
    
    const emojiCount = countEmojis(submittedEmojis);
    if (emojiCount !== 3) {
        toast({
            title: 'Invalid Emoji Count',
            description: 'Please use exactly 3 emojis.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!name || !submittedEmojis || !tokens) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all fields.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
      const batch = writeBatch(firestore);
      const badgeRef = doc(collection(firestore, 'badges'));
      
      // 1. Create the badge
      batch.set(badgeRef, {
        name,
        emojis: submittedEmojis,
        tokens,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
      });

      // 2. Add the creator as the first owner
      const ownerRef = doc(collection(firestore, `badges/${badgeRef.id}/owners`), user.uid);
      batch.set(ownerRef, {
        userId: user.uid,
        badgeId: badgeRef.id,
        claimedAt: serverTimestamp()
      });
      
      await batch.commit();
        
      toast({
          title: 'Badge Created!',
          description: `Your badge "${name}" has been successfully created.`,
      });
      
      setBurstEmojis(submittedEmojis);

      // Immediately redirect to show the share dialog
      setTimeout(() => handleAnimationComplete(badgeRef.id), 1500);

    } catch (error: any) {
        console.error("Error creating badge: ", error);
        toast({
            title: 'Creation Failed',
            description: "There was an issue creating your badge. Please try again.",
            variant: 'destructive',
        });
        setIsLoading(false);
    }
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
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !user || !!burstEmojis}>
                {isLoading || burstEmojis ? 'Creating...' : 'Create Badge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
    </>
  );
}
