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
import { type Badge, transferBadgeOwnership, type User } from '@/lib/data';
import { Combobox } from '@/components/ui/combobox';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  onTransfer: () => void;
};

export function TransferBadgeDialog({ open, onOpenChange, badge, onTransfer }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [recipientId, setRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Query for users who own the badge but are not the original creator
    const potentialOwnersQuery = badge ? query(
        collection(firestore, 'users'),
        where('id', 'in', badge.owners.filter(id => id !== badge.ownerId))
    ) : null;

    const { data: usersData, loading: usersLoading } = useCollection<User>(potentialOwnersQuery);

    const usersOptions = usersData?.map(u => ({ value: u.id, label: `${u.name} (email: ${u.email})` })) ?? [];
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const newOwner = usersData?.find(u => u.id === recipientId);
            if (!newOwner) throw new Error("Recipient not found or is not an owner of this badge.");

            await transferBadgeOwnership(badge.id, badge.ownerId, recipientId);
            toast({
                title: "Transfer Complete!",
                description: `Ownership of "${badge.name}" has been transferred to ${newOwner.name}.`,
                variant: "default",
            });
            onTransfer();
            onOpenChange(false);
        } catch (error: any) {
             toast({
                title: "Transfer Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
                notFoundText={usersLoading ? "Loading users..." : "No eligible owners found."}
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
