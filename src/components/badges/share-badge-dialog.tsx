
'use client';

import { useState } from 'react';
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
import { Copy, QrCode, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createShareLinks, Badge, ShareLink } from '@/lib/data';
import Image from 'next/image';

type ShareLinkInfo = {
    id: string;
    url: string;
}

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge;
  initialLinks?: ShareLink[];
};

export function ShareBadgeDialog({ open, onOpenChange, badge, initialLinks = [] }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    const [links, setLinks] = useState<ShareLinkInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const currentUserId = 'user-1';

    const generateLinks = () => {
        setIsLoading(true);
        // Always generate 3 new links for the current user
        const newLinks = createShareLinks(badge.id, currentUserId, 3);
        if (newLinks.length === 0) {
             toast({ title: "No more badges to share!", description: "The token limit for this badge has been reached.", variant: "default" });
        } else {
             toast({ title: "New links generated!", description: "You have new links to share.", variant: "default" });
        }
        const fullUrls = newLinks.map(link => ({
            id: link.linkId,
            url: `${window.location.origin}/join/${link.linkId}`
        }));
        setLinks(fullUrls);
        setIsLoading(false);
    }
    
    // Set initial links when the dialog opens for the first time
    useState(() => {
         if (open && initialLinks.length > 0) {
            const fullUrls = initialLinks.map(link => ({
                id: link.linkId,
                url: `${window.location.origin}/join/${link.linkId}`
            }));
            setLinks(fullUrls);
        } else if (open) {
            generateLinks();
        }
    });
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
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
            Share these unique, one-time use links to invite others to claim this badge. New links can be generated.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[200px]">
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
          )) : (
            <div className="flex justify-center items-center h-full">
                <p className="text-sm text-muted-foreground text-center">
                    {isLoading ? "Generating links..." : "No more links to share. All tokens have been claimed."}
                </p>
            </div>
          )}
        </div>
         <DialogFooter>
          <Button variant="outline" onClick={generateLinks} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate New Links
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
