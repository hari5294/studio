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

type TransferBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeName: string;
};

export function TransferBadgeDialog({ open, onOpenChange, badgeName }: TransferBadgeDialogProps) {
    const { toast } = useToast();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Transfer Initiated",
            description: `The transfer of "${badgeName}" is now pending confirmation.`,
            variant: "default",
        });
        onOpenChange(false);
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            Transfer "{badgeName}"
          </DialogTitle>
          <DialogDescription>
            Transfer ownership of this badge to another user. This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-id">Recipient's User ID</Label>
              <Input id="user-id" placeholder="e.g., user-5" required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-code">Your Secret Code</Label>
              <Input id="secret-code" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive">Confirm Transfer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
