'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBadgeById, getUserById, User } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  Users,
  Share2,
  ArrowRightLeft,
  ChevronsUp,
  Vote,
  Crown
} from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { useToast } from '@/hooks/use-toast';

export default function BadgeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const badge = getBadgeById(params.id);

  const [isShareOpen, setShareOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);

  if (!badge) {
    notFound();
  }
  
  const currentUserId = 'user-1';
  const isCreator = badge.ownerId === currentUserId;
  const isOwner = badge.owners.includes(currentUserId);

  const creator = getUserById(badge.ownerId);
  const owners = badge.owners.map(id => getUserById(id)).filter(Boolean) as User[];
  const followers = badge.followers.map(id => getUserById(id)).filter(Boolean) as User[];
  const badgesLeft = badge.tokens - owners.length;
  
  return (
    <>
      <Header title="Badge Details" />
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-6xl mb-4">{badge.emojis}</div>
                    <CardTitle className="font-headline text-3xl">{badge.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                       Created by
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={creator?.avatarUrl} alt={creator?.name} />
                        <AvatarFallback>{creator?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {creator?.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{badgesLeft.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Badges Left</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                    {isOwner && (
                        <Button onClick={() => setShareOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    )}
                  {isCreator && (
                    <Button variant="outline" onClick={() => setTransferOpen(true)}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
                  )}
                   <Button variant="secondary">
                      Follow
                   </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Crown className="h-6 w-6" />
                        Owners ({owners.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {owners.map((user) => (
                        <div key={user.id} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{user.name}</p>
                        </div>
                    ))}
                    {owners.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No one owns this badge yet.</p>
                    )}
                    </div>
                </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Followers ({followers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  ))}
                  {followers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Vote className="h-6 w-6" />
                  Token Increase Vote
                </CardTitle>
                <CardDescription>
                    This feature is now disabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">The token system has been updated to represent badge ownership count and can no longer be increased by voting.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ShareBadgeDialog open={isShareOpen} onOpenChange={setShareOpen} badgeName={badge.name} />
      <TransferBadgeDialog open={isTransferOpen} onOpenChange={setTransferOpen} badgeName={badge.name} />
    </>
  );
}
