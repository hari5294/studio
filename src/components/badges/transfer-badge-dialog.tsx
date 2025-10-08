
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
import React, { useState, useEffect } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { AppUser } from '@/firebase/auth/use-user';
import { firestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

type Badge = { id: string; name: string; creatorId: string; };

type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  onTransfer: (newOwnerId: string) => void;
  ownerUserIds: string[];
};

export function TransferBadgeDialog({ open, onOpenChange, badge, onTransfer, ownerUserIds }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    const [recipientId, setRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [eligibleUsers, setEligibleUsers] = useState<{ value: string, label: string }[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        if (!open || ownerUserIds.length === 0) {
            setEligibleUsers([]);
            setLoadingUsers(false);
            return;
        }

        const fetchEligibleUsers = async () => {
            setLoadingUsers(true);
            try {
                const usersRef = collection(firestore, 'users');
                const q = query(usersRef, where('__name__', 'in', ownerUserIds));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    value: doc.id,
                    label: doc.data().name || 'Unnamed User'
                }));
                setEligibleUsers(usersData);
            } catch (error) {
                console.error("Error fetching eligible users:", error);
                toast({ title: "Could not load users", variant: "destructive" });
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchEligibleUsers();
    }, [open, ownerUserIds, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onTransfer(recipientId);
            onOpenChange(false);
            setRecipientId('');
        } catch (error) {
            // Error toast is handled in parent component
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
          <div className="space-y-4 py-4 min-h-[100px]">
            {loadingUsers ? (
                <div className="space-y-2">
                    <Label htmlFor="user-id">Recipient</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="space-y-2">
                <Label htmlFor="user-id">Recipient</Label>
                <Combobox
                    options={eligibleUsers}
                    value={recipientId}
                    onChange={setRecipientId}
                    placeholder="Select a new owner..."
                    searchPlaceholder="Search for a user..."
                    notFoundText={"No eligible owners found."}
                />
                </div>
            )}
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

    