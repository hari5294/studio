
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, PlusCircle, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useCollection, firestore, useUser } from '@/firebase';
import { AppUser } from '@/firebase/auth/use-user';
import { collection, query, where, writeBatch, doc, serverTimestamp } from 'firebase/firestore';


type Badge = { id: string; name: string; };

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  user: AppUser;
};

export function ShareBadgeDialog({ open, onOpenChange, badge, user }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = React.useState(false);

    const linksQuery = user ? query(
        collection(firestore, 'shareLinks'),
        where('badgeId', '==', badge.id),
        where('ownerId', '==', user.uid),
        where('used', '==', false)
    ) : null;
    
    const { data: availableLinks, loading: loadingLinks } = useCollection(linksQuery);

    const handleCreateLinks = async () => {
        if (!user) return;
        setIsCreating(true);
        try {
            const batch = writeBatch(firestore);
            for (let i = 0; i < 5; i++) {
                const shareLinkRef = doc(collection(firestore, 'shareLinks'));
                batch.set(shareLinkRef, {
                    badgeId: badge.id,
                    ownerId: user.uid,
                    used: false,
                    claimedBy: null,
                    createdAt: serverTimestamp(),
                });
            }
            await batch.commit();
            toast({ title: "5 new codes created!" });
        } catch (error) {
            console.error("Error creating share links:", error);
            toast({ title: "Failed to create codes", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied code to clipboard!" });
    }
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Share "{badge.name}"
          </DialogTitle>
          <DialogDescription>
            Share these one-time use codes to invite others to claim this badge.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[150px]">
          {loadingLinks && (
             <div className="flex flex-col items-center justify-center gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          )}
          {!loadingLinks && availableLinks && availableLinks.length > 0 && (
              <div className="space-y-3">
                {availableLinks.map(link => (
                    <div key={link.id} className="flex items-center gap-2 w-full">
                      <Input readOnly value={link.id} className="bg-muted font-mono text-xs" />
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.id)}>
                          <Copy className="h-4 w-4"/>
                      </Button>
                    </div>
                ))}
              </div>
          )}
           {!loadingLinks && (!availableLinks || availableLinks.length === 0) && (
            <div className="flex flex-col justify-center items-center h-full text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                    You have no more unique codes to share for this badge.
                </p>
            </div>
          )}
        </div>
        <DialogFooter>
            <Button 
                variant="outline" 
                onClick={handleCreateLinks} 
                disabled={isCreating || (availableLinks && availableLinks.length > 0)}
                title={availableLinks && availableLinks.length > 0 ? "You must use your existing codes first." : "Generate 5 new codes"}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreating ? "Generating..." : "Generate 5 More"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
