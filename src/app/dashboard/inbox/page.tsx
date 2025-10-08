
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon, Check, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { AppUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, doc, updateDoc, writeBatch, serverTimestamp, runTransaction, getDoc, getDocs } from 'firebase/firestore';
import { EmojiBurst } from '@/components/effects/emoji-burst';


type Notification = {
  id: string;
  type: 'BADGE_REQUEST' | 'BADGE_RECEIVED' | 'OWNERSHIP_TRANSFER';
  fromUserId: string;
  badgeId: string;
  createdAt: any; // Firestore timestamp
  read: boolean;
  shareLinkId?: string;
};

type Badge = {
  id: string;
  name: string;
  emojis: string;
  tokens: number;
};

type EnrichedNotification = Notification & {
  fromUser?: AppUser;
  badge?: Badge;
};

function NotificationItem({ notification, onSendCode, onNewBadgeReceived }: { notification: EnrichedNotification; onSendCode: (badgeId: string, toUserId: string, toUserName: string) => Promise<void>, onNewBadgeReceived: (emojis: string) => void }) {
  const firestore = useFirestore();
  const [isSending, setIsSending] = useState(false);
  const fromUserRef = notification.fromUserId ? doc(firestore, 'users', notification.fromUserId) : null;
  const { data: fromUser, loading: loadingUser } = useDoc<AppUser>(fromUserRef);

  const badgeRef = notification.badgeId ? doc(firestore, 'badges', notification.badgeId) : null;
  const { data: badge, loading: loadingBadge } = useDoc<Badge>(badgeRef);
  
  useEffect(() => {
    if (notification.type === 'BADGE_RECEIVED' && !notification.read && badge) {
        onNewBadgeReceived(badge.emojis);
    }
  }, [notification, badge, onNewBadgeReceived]);


  if (loadingUser || loadingBadge) {
    return <Skeleton className="h-20 w-full" />;
  }
  
  if (!fromUser || !badge) {
    return null; // Or some error state
  }

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSending(true);
    try {
        await onSendCode(badge.id, fromUser.id!, fromUser.name || 'User');
    } catch {
        // If there's an error (e.g. no badges left), re-enable the button
        setIsSending(false);
    }
  };

  const itemContent = {
    'BADGE_REQUEST': {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: (
        <p>
          <Link href={`/dashboard/profile/${fromUser.id}`} className="font-bold hover:underline">{fromUser.name}</Link>
          {' '} requested your {' '}
          <Link href={`/dashboard/badge/${badge.id}`} className="font-bold hover:underline">{badge.name}</Link> badge.
        </p>
      ),
      action: (
        <Button size="sm" onClick={handleSendCode} disabled={isSending}>
            {isSending ? (
                <>
                    <Check className="mr-2 h-4 w-4" /> Sent
                </>
            ) : (
                <>
                    Send Badge <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
      )
    },
    'BADGE_RECEIVED': {
      icon: <PartyPopper className="h-6 w-6 text-accent" />,
      title: (
        <p>
          You received the {' '}
          <Link href={`/dashboard/badge/${badge.id}`} className="font-bold hover:underline">{badge.name}</Link> badge from {' '}
          <Link href={`/dashboard/profile/${fromUser.id}`} className="font-bold hover:underline">{fromUser.name}</Link>!
        </p>
      ),
      action: (
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/dashboard/badge/${badge.id}`}>
            View Badge <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )
    },
    'OWNERSHIP_TRANSFER': {
      icon: <Gift className="h-6 w-6 text-accent" />,
      title: (
        <p>
          Ownership of the {' '}
          <Link href={`/dashboard/badge/${badge.id}`} className="font-bold hover:underline">{badge.name}</Link> badge has been transferred to you!
        </p>
      ),
      action: (
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/dashboard/badge/${badge.id}`}>
            View Badge <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )
    }
  };

  const { icon, title, action } = itemContent[notification.type];
  const createdAtDate = notification.createdAt?.toDate ? notification.createdAt.toDate() : new Date();


  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50",
      !notification.read && "bg-muted"
    )}>
      <div className="pt-1">{icon}</div>
      <div className="flex-grow space-y-1">
        <div className="text-sm">{title}</div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(createdAtDate, { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center">{action}</div>
    </div>
  );
}

export default function InboxPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);


  const notificationsQuery = user ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc')) : null;
  const { data: notifications, loading: notificationsLoading } = useCollection<Notification>(notificationsQuery);
  
  const handleNewBadgeReceived = (emojis: string) => {
    setBurstEmojis(emojis);
    setTimeout(() => setBurstEmojis(null), 2000);
  }

  useEffect(() => {
    if (user && notifications) {
      const unread = notifications.filter(n => !n.read);
      if (unread.length > 0) {
        // We delay marking as read slightly to allow the burst animation to trigger
        const timer = setTimeout(() => {
            const batch = writeBatch(firestore);
            unread.forEach(n => {
              const notifRef = doc(firestore, `users/${user.uid}/notifications`, n.id);
              batch.update(notifRef, { read: true });
            });
            batch.commit().catch(console.error);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, notifications, firestore]);

  const handleSendCode = async (badgeId: string, toUserId: string, toUserName: string) => {
    if (!user) return;

    try {
        await runTransaction(firestore, async (transaction) => {
            const badgeRef = doc(firestore, 'badges', badgeId);
            const ownersRef = collection(firestore, `badges/${badgeId}/owners`);

            const [badgeSnap, ownersSnap] = await Promise.all([
                transaction.get(badgeRef),
                getDocs(ownersRef)
            ]);

            if (!badgeSnap.exists()) {
                throw new Error("Badge does not exist.");
            }

            const badgeData = badgeSnap.data();
            const badgesLeft = badgeData.tokens - ownersSnap.size;

            if (badgesLeft <= 0) {
                throw new Error("No badges left to send.");
            }

            // Add new owner
            const newOwnerRef = doc(firestore, `badges/${badgeId}/owners`, toUserId);
            transaction.set(newOwnerRef, {
                badgeId: badgeId,
                userId: toUserId,
                claimedAt: serverTimestamp()
            });

            // Send notification to recipient
            const notificationRef = doc(collection(firestore, `users/${toUserId}/notifications`));
            transaction.set(notificationRef, {
                type: 'BADGE_RECEIVED',
                fromUserId: user.uid,
                badgeId: badgeId,
                createdAt: serverTimestamp(),
                read: false,
            });
        });
        
        toast({
            title: 'Badge Sent!',
            description: `You sent the badge to ${toUserName}.`
        });
    } catch (error: any) {
        console.error("Error sending badge: ", error);
        toast({ title: 'Could not send badge', description: error.message, variant: 'destructive'});
        // re-throw to allow the component to handle UI state
        throw error;
    }
  };

  const loading = userLoading || notificationsLoading;

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Header title="Inbox" />
        <Skeleton className="h-10 w-full mb-4 max-w-sm mx-auto" />
        <Skeleton className="h-64 w-full max-w-4xl mx-auto" />
      </div>
    );
  }

  const requests = notifications?.filter((n) => n.type === 'BADGE_REQUEST') || [];
  const received = notifications?.filter((n) => ['BADGE_RECEIVED', 'OWNERSHIP_TRANSFER'].includes(n.type)) || [];


  return (
    <>
      <Header title="Inbox" />
      <div className="flex-1 p-4 md:p-6">
        {notifications && notifications.length > 0 ? (
          <Tabs defaultValue="requests" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">
                Badge Requests ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({received.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Badge Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length > 0 ? (
                    <div className="space-y-2">
                      {requests.map(n => <NotificationItem key={n.id} notification={n} onSendCode={handleSendCode} onNewBadgeReceived={handleNewBadgeReceived} />)}
                    </div>
                  ) : <p className="text-center text-muted-foreground py-8">No badge requests yet.</p>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="received">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Received</CardTitle>
                </CardHeader>
                <CardContent>
                  {received.length > 0 ? (
                    <div className="space-y-2">
                      {received.map(n => <NotificationItem key={n.id} notification={n} onSendCode={handleSendCode} onNewBadgeReceived={handleNewBadgeReceived} />)}
                    </div>
                  ) : <p className="text-center text-muted-foreground py-8">You haven't received any new badges.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg max-w-4xl mx-auto">
            <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Your inbox is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll see requests for your badges and notifications for badges you receive here.
            </p>
          </div>
        )}
      </div>
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
    </>
  );
}

    