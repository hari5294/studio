'use client';

import { EmojiBadgeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JoinPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Successfully Joined!',
      description: "You are now a follower of the 'Cosmic Explorers' badge.",
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-6xl">🚀✨🪐</div>
          </div>
          <CardTitle className="text-2xl font-headline">Join 'Cosmic Explorers'</CardTitle>
          <CardDescription>
            You've been invited! Enter the secret code to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="secret-code">Secret Code</Label>
              <Input
                id="secret-code"
                type="password"
                placeholder="Enter the secret code"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Join Badge
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            <Link href="/dashboard" className="underline">
              Cancel
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
