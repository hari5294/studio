
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
import { createShareLinks, Badge } from '@/lib/data';
import Image from 'next/image';

type ShareLinkInfo = {
    id: string;
    url: string;
}

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
};

export function ShareBadgeDialog({ open, onOpenChange, badge }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    const [links, setLinks] = useState<ShareLinkInfo[]>([]);

    useEffect(() => {
        if (open) {
            const newLinks = createShareLinks(badge.id, 3);
            const fullUrls = newLinks.map(link => ({
                id: link.linkId,
                url: `${window.location.origin}/join/${link.linkId}`
            }));
            setLinks(fullUrls);
        }
    }, [open, badge.id]);
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
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
            Share these unique, one-time use links to invite others to claim ownership of this badge. Each link expires after 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {links.length > 0 ? links.map((link) => (
              <div key={link.id} className="flex items-center gap-4">
                 <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(link.url)}`}
                    alt="QR Code"
                    width={80}
                    height={80}
                    className="rounded-md"
                    data-ai-hint="qr code"
                  />
                <div className="flex-grow">
                    <p className="text-sm font-medium">Ownership Link</p>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={link.url} className="bg-muted" />
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.url)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
              </div>
          )) : <p className="text-sm text-muted-foreground text-center">Generating links...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
