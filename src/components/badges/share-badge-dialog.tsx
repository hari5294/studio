
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, QrCode, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createShareLinks, getShareLinksForUser, Badge, ShareLink } from '@/lib/data';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  initialLinks?: ShareLink[];
};

export function ShareBadgeDialog({ open, onOpenChange, badge, initialLinks = [] }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    const [links, setLinks] = useState<ShareLink[]>(initialLinks);
    const [isLoading, setIsLoading] = useState(false);
    const currentUserId = 'user-1';

    const fetchLinks = () => {
        setIsLoading(true);
        const userLinks = getShareLinksForUser(badge.id, currentUserId);
        setLinks(userLinks);
        setIsLoading(false);
    }
    
    const generateNewLinks = () => {
        setIsLoading(true);
        const newLinks = createShareLinks(badge.id, currentUserId, 3);
        if (newLinks.length === 0) {
            toast({ title: "No more badges to share!", description: "The token limit for this badge has been reached.", variant: "default" });
        } else {
            toast({ title: "New share codes generated!", description: "You have new unique codes to share.", variant: "default" });
        }
        fetchLinks();
    }
    
    useEffect(() => {
        if (open) {
            if (initialLinks.length > 0) {
                 setLinks(initialLinks);
            } else {
                 fetchLinks();
            }
        }
    }, [open, initialLinks]);
    
    const copyToClipboard = (text: string) => {
        const fullUrl = `${window.location.origin}/join/${text}`;
        navigator.clipboard.writeText(fullUrl);
        toast({ title: "Copied link to clipboard!" });
    }
    
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setLinks([]); // Clear links when closing
        }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Share "{badge.name}"
          </DialogTitle>
          <DialogDescription>
            Share these unique, one-time use codes to invite others to claim this badge.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[150px]">
          {isLoading && (
             <div className="flex flex-col items-center justify-center gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          )}
          {!isLoading && links.length > 0 && (
              <div className="space-y-3">
                {links.map(link => (
                    <div key={link.linkId} className="flex items-center gap-2 w-full">
                       <Image
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${encodeURIComponent(`${window.location.origin}/join/${link.linkId}`)}`}
                          alt="QR Code"
                          width={40}
                          height={40}
                          className="rounded-md"
                          data-ai-hint="qr code"
                        />
                      <Input readOnly value={link.linkId} className="bg-muted font-mono text-xs" />
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.linkId)}>
                          <Copy className="h-4 w-4"/>
                      </Button>
                    </div>
                ))}
              </div>
          )}
           {!isLoading && links.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                    You have no share codes. Generate new ones if tokens are available.
                </p>
                <Button onClick={generateNewLinks}>
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    Generate Codes
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
