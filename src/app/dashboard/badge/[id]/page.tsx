'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBadgeById, getUserById, User } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Users,
  Share2,
  ArrowRightLeft,
  ChevronsUp,
  Vote,
} from 'lucide-react';
import { ShareBadgeDialog } from '@/components/badges/share-badge-dialog';
import { TransferBadgeDialog } from '@/components/badges/transfer-badge-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function BadgeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const badge = getBadgeById(params.id);

  const [isShareOpen, setShareOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [voted, setVoted] = useState(false);

  if (!badge) {
    notFound();
  }
  
  const isOwner = badge.ownerId === 'user-1';

  const owner = getUserById(badge.ownerId);
  const followers = badge.followers.map(id => getUserById(id)).filter(Boolean) as User[];
  
  const handleVote = () => {
    setVoted(true);
    toast({
        title: "Vote Cast!",
        description: "Thank you for participating."
    })
  }

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
                       Owned by
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={owner?.avatarUrl} alt={owner?.name} />
                        <AvatarFallback>{owner?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {owner?.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{badge.tokens.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tokens</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setShareOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  {isOwner && (
                    <Button variant="outline" onClick={() => setTransferOpen(true)}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
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
                    {isOwner ? "Request a 9% increase in this badge's tokens." : "The owner has requested a token increase. Cast your vote!"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Approval</span>
                        <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} />
                    <p className="text-xs text-muted-foreground mt-1">3 of 5 members have voted yes. 75% needed to pass.</p>
                </div>
                {isOwner ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="outline" className="w-full">
                                <ChevronsUp className="mr-2 h-4 w-4"/>
                                Request 9% Token Increase
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You can only request a token increase once. This will initiate a vote among badge followers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toast({title: "Vote Initiated!", description: "Followers can now vote on the token increase."})}>
                                Confirm
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <div className="flex gap-4">
                        <Button className="flex-1" onClick={handleVote} disabled={voted}>Vote Yes</Button>
                        <Button variant="secondary" className="flex-1" onClick={handleVote} disabled={voted}>Vote No</Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>
      <ShareBadgeDialog open={isShareOpen} onOpenChange={setShareOpen} badgeName={badge.name} />
      <TransferBadgeDialog open={isTransferOpen} onOpenChange={setTransferOpen} badgeName={badge.name} />
    </>
  );
}
