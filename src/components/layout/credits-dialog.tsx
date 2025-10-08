
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sparkles, Mail, Send } from 'lucide-react';
import Link from 'next/link';

type CreditsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreditsDialog({ open, onOpenChange }: CreditsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Credits
          </DialogTitle>
          <DialogDescription>
            This application was created by a talented team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <h3 className="font-semibold">Creators</h3>
                <p className="text-muted-foreground">Jothibasu</p>
                <p className="text-muted-foreground">Harivignesh</p>
            </div>
            <div>
                <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                </h3>
                <a href="mailto:lharivignesh023@gmail.com" className="text-primary hover:underline">
                    lharivignesh023@gmail.com
                </a>
            </div>
             <div>
                <h3 className="font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Fun Group
                </h3>
                <Link href="https://t.me/+AaAeMVnejWZkZmM1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Join us on Telegram
                </Link>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
