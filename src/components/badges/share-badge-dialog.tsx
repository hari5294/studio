'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ShareBadgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeName: string;
};

const shareLinks = [
  { id: 'link1', url: 'https://emojibadge.app/join/xyz123', qrId: 'qr-code-1' },
  { id: 'link2', url: 'https://emojibadge.app/join/abc456', qrId: 'qr-code-2' },
  { id: 'link3', url: 'https://emojibadge.app/join/def789', qrId: 'qr-code-3' },
];

export function ShareBadgeDialog({ open, onOpenChange, badgeName }: ShareBadgeDialogProps) {
    const { toast } = useToast();
    
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
            Share "{badgeName}"
          </DialogTitle>
          <DialogDescription>
            Share these unique, one-time use links to invite others to join your badge.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {shareLinks.map((link) => {
            const qrImage = PlaceHolderImages.find((img) => img.id === link.qrId);
            return (
              <div key={link.id} className="flex items-center gap-4">
                {qrImage && (
                  <Image
                    src={qrImage.imageUrl}
                    alt="QR Code"
                    width={80}
                    height={80}
                    className="rounded-md"
                    data-ai-hint={qrImage.imageHint}
                  />
                )}
                <div className="flex-grow">
                    <p className="text-sm font-medium">Join Link</p>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={link.url} className="bg-muted" />
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.url)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
