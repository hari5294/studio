
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
import { Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createShareLink, Badge, ShareLink } from '@/lib/data';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  initialLink?: ShareLink;
};

export function ShareBadgeDialog({ open, onOpenChange, badge, initialLink }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    const [link, setLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const currentUserId = 'user-1';

    const generateLink = () => {
        setIsLoading(true);
        setLink(null);
        try {
            const newLink = createShareLink(badge.id, currentUserId);
            if (!newLink) {
                 toast({ title: "No more badges to share!", description: "The token limit for this badge has been reached.", variant: "default" });
            } else {
                 const fullUrl = `${window.location.origin}/join/${newLink.linkId}`;
                 setLink(fullUrl);
                 toast({ title: "New share code generated!", description: "You have a new unique code to share.", variant: "default" });
            }
        } catch (e: any) {
             toast({ title: "Failed to generate link", description: e.message, variant: "destructive" });
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        if (open) {
            if (initialLink) {
                const fullUrl = `${window.location.origin}/join/${initialLink.linkId}`;
                setLink(fullUrl);
            } else {
                generateLink();
            }
        }
    }, [open, initialLink]); // Rerun when dialog is opened or initialLink changes
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    }
    
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setLink(null); // Clear link when closing
        }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Share "{badge.name}"
          </DialogTitle>
          <DialogDescription>
            Share this unique, one-time use code to invite someone to claim this badge. A new code is generated each time you open this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[150px] flex items-center justify-center">
          {isLoading && (
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <Skeleton className="h-10 w-full" />
             </div>
          )}
          {!isLoading && link && (
              <div className="flex items-center gap-4 w-full">
                 <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(link)}`}
                    alt="QR Code"
                    width={80}
                    height={80}
                    className="rounded-md"
                    data-ai-hint="qr code"
                  />
                <div className="flex-grow">
                    <p className="text-sm font-medium">Unique Ownership Code</p>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={link} className="bg-muted" />
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
              </div>
          )}
           {!isLoading && !link && (
            <div className="flex justify-center items-center h-full">
                <p className="text-sm text-muted-foreground text-center">
                    No more badges can be shared. All tokens have been claimed.
                </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
