'use client';

import { useState } from 'react';
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
import { Badge, ShareLink } from '@/lib/data';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  links: ShareLink[];
  isLoading?: boolean;
};

export function ShareBadgeDialog({ open, onOpenChange, badge, links = [], isLoading = false }: ShareBadgeDialogProps) {
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        if (typeof window === 'undefined') return;
        const fullUrl = `${window.location.origin}/join/${text}`;
        navigator.clipboard.writeText(fullUrl);
        toast({ title: "Copied link to clipboard!" });
    }
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Share "{badge.name}"
          </DialogTitle>
          <DialogDescription>
            Share these permanent, one-time use codes to invite others to claim this badge.
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
                    You have no more unique codes to share for this badge.
                </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
