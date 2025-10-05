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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import type { User } from '@/hooks/use-auth';

type Badge = { id: string; name: string; creatorId: string; };

type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  onTransfer: (newOwnerId: string) => void;
  users: User[];
};

export function TransferBadgeDialog({ open, onOpenChange, badge, onTransfer, users }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    const [recipientId, setRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const usersOptions = users
        .filter(u => u.id !== badge.creatorId)
        .map(u => ({ value: u.id, label: u.name }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        
        setTimeout(() => {
            try {
                onTransfer(recipientId);
                const recipient = users.find(u => u.id === recipientId);
                toast({
                    title: "Transfer Complete!",
                    description: `Ownership of "${badge.name}" has been transferred to ${recipient?.name}.`,
                    variant: "default",
                });
                onOpenChange(false);
                setRecipientId('');
            } catch (error: any) {
                 toast({
                    title: "Transfer Failed",
                    description: error.message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            Transfer "{badge.name}"
          </DialogTitle>
          <DialogDescription>
            Transfer creation ownership of this badge to another user. This action is irreversible. The new owner must already own a copy of the badge.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-id">Recipient</Label>
              <Combobox
                options={usersOptions}
                value={recipientId}
                onChange={setRecipientId}
                placeholder="Select a new owner..."
                searchPlaceholder="Search for a user..."
                notFoundText={"No eligible owners found."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={!recipientId || isLoading}>
                {isLoading ? 'Transferring...' : 'Confirm Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
