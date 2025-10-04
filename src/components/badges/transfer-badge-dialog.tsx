
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
import { ArrowRightLeft } from 'lucide-react';
import React from 'react';
import { Badge, transferBadgeOwnership, getUserById, getAllUsers } from '@/lib/data';
import { Combobox } from '@/components/ui/combobox';

type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  onTransfer: () => void;
};

export function TransferBadgeDialog({ open, onOpenChange, badge, onTransfer }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    const [recipientId, setRecipientId] = React.useState('');
    
    const users = getAllUsers()
      .filter(u => u.id !== badge.ownerId) // Can't transfer to the current creator
      .map(u => ({ value: u.id, label: `${u.name} (ID: ${u.id})` }));
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const newOwner = getUserById(recipientId);
            if (!newOwner) throw new Error("Recipient not found.");

            transferBadgeOwnership(badge.id, recipientId);
            toast({
                title: "Transfer Complete!",
                description: `Ownership of "${badge.name}" has been transferred to ${newOwner.name}.`,
                variant: "default",
            });
            onTransfer(); // Force re-render on the parent page
            onOpenChange(false);
        } catch (error: any) {
             toast({
                title: "Transfer Failed",
                description: error.message,
                variant: "destructive",
            });
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
                options={users}
                value={recipientId}
                onChange={setRecipientId}
                placeholder="Select a new owner..."
                searchPlaceholder="Search for a user..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={!recipientId}>Confirm Transfer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
