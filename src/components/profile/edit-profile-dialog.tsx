
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Smile } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getFirstEmoji, isOnlyEmojis } from '@/lib/utils';
import { AppUser } from '@/firebase/auth/use-user';

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser;
  onUpdate: (updatedUser: { emojiAvatar?: string }) => Promise<void>;
};

export function EditProfileDialog({ open, onOpenChange, user, onUpdate }: EditProfileDialogProps) {
    const { toast } = useToast();
    const [emoji, setEmoji] = useState(user.emojiAvatar || '');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if(open) {
            setEmoji(user.emojiAvatar || '');
        }
    }, [open, user.emojiAvatar]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (emoji && !isOnlyEmojis(emoji)) {
             toast({
                title: 'Invalid Input',
                description: 'Please enter only an emoji to use as your avatar.',
                variant: 'destructive',
            });
            return;
        }
        
        setIsLoading(true);
        const cleanEmoji = getFirstEmoji(emoji);
        
        try {
            await onUpdate({ emojiAvatar: cleanEmoji });
            onOpenChange(false);
        } catch (error: any) {
             // Toast is handled by the parent component
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Smile className="h-6 w-6 text-primary" />
            Edit Profile Picture
          </DialogTitle>
          <DialogDescription>
            Set a new emoji as your avatar. Only the first emoji will be used.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emoji-avatar">Your Emoji</Label>
              <Input 
                id="emoji-avatar"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="😀"
                maxLength={2} // Limit input length to avoid long strings
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
