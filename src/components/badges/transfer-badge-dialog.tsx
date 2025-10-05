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
import React, { useState, useMemo } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useAuth, useCollection, useDoc, useFirestore } from '@/firebase';
import { Badge, User, BadgeOwner } from '@/lib/mock-data';
import { doc, collection, writeBatch } from 'firebase/firestore';


type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  onTransfer: (newOwnerId: string) => void;
};

export function TransferBadgeDialog({ open, onOpenChange, badge, onTransfer }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: currentUser } = useAuth();
    
    const [recipientId, setRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const ownersQuery = useMemo(() => firestore ? collection(firestore, 'badges', badge.id, 'owners') : null, [firestore, badge.id]);
    const { data: owners } = useCollection<BadgeOwner>(ownersQuery);

    const usersOptions = owners
        ?.filter(o => o.userId !== badge.creatorId)
        .map(o => ({ value: o.userId, label: 'Loading...' })) ?? []; // Label will be updated below

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !currentUser) return;

        setIsLoading(true);
        
        try {
            const batch = writeBatch(firestore);
            
            const badgeRef = doc(firestore, 'badges', badge.id);
            batch.update(badgeRef, { creatorId: recipientId });

            const notificationRef = doc(collection(firestore, 'users', recipientId, 'notifications'));
            batch.set(notificationRef, {
                type: 'OWNERSHIP_TRANSFER',
                userId: recipientId,
                fromUserId: badge.creatorId,
                badgeId: badge.id,
                createdAt: Date.now(),
                read: false,
            });

            await batch.commit();

            toast({
                title: "Transfer Complete!",
                description: `Ownership of "${badge.name}" has been transferred.`,
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
                options={usersOptions} // This needs rework to be async
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
