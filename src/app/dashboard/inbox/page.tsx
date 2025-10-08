
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { AppUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

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
};

type EnrichedNotification = Notification & {
  fromUser?: AppUser;
  badge?: Badge;
};

function NotificationItem({ notification, onSendCode }: { notification: EnrichedNotification; onSendCode: (badgeId: string, toUserId: string, toUserName: string) => void }) {
  const firestore = useFirestore();
  const fromUserRef = notification.fromUserId ? doc(firestore, 'users', notification.fromUserId) : null;
  const { data: fromUser, loading: loadingUser } = useDoc<AppUser>(fromUserRef);

  const badgeRef = notification.badgeId ? doc(firestore, 'badges', notification.badgeId) : null;
  const { data: badge, loading: loadingBadge } = useDoc<Badge>(badgeRef);

  if (loadingUser || loadingBadge) {
    return <Skeleton className="h-20 w-full" />;
  }
  
  if (!fromUser || !badge) {
    return null; // Or some error state
  }

  const handleSendCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSendCode(badge.id, fromUser.id!, fromUser.name || 'User');
  };

  const itemContent = {
    'BADGE_REQUEST': {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: (
        <p>
          <Link href={`/dashboard/profile/${fromUser.id}`} className="font-bold hover:underline">{fromUser.name}</Link>
          {' '} requested a code for your {' '}
          <Link href={`/dashboard/badge/${badge.id}`} className="font-bold hover:underline">{badge.name}</Link> badge.
        </p>
      ),
      action: (
        <Button size="sm" onClick={handleSendCode}>
          Send Code <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    'BADGE_RECEIVED': {
      icon: <Gift className="h-6 w-6 text-accent" />,
      title: (
        <p>
          <Link href={`/dashboard/profile/${fromUser.id}`} className="font-bold hover:underline">{fromUser.name}</Link>
          {' '} sent you a code for the {' '}
          <Link href={`/dashboard/badge/${badge.id}`} className="font-bold hover:underline">{badge.name}</Link> badge!
        </p>
      ),
      action: (
        <Button size="sm" variant="secondary" asChild disabled={!notification.shareLinkId}>
          <Link href={`/join/${notification.shareLinkId}`}>
            Redeem Badge <ArrowRight className="ml-2 h-4 w-4" />
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

  const notificationsQuery = user ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc')) : null;
  const { data: notifications, loading: notificationsLoading } = useCollection<Notification>(notificationsQuery);
  
  useEffect(() => {
    if (user && notifications) {
      const unread = notifications.filter(n => !n.read);
      if (unread.length > 0) {
        const batch = writeBatch(firestore);
        unread.forEach(n => {
          const notifRef = doc(firestore, `users/${user.uid}/notifications`, n.id);
          batch.update(notifRef, { read: true });
        });
        batch.commit().catch(console.error);
      }
    }
  }, [user, notifications, firestore]);

  const handleSendCode = async (badgeId: string, toUserId: string, toUserName: string) => {
    if (!user) return;

    try {
        const batch = writeBatch(firestore);

        // 1. Create a new share link
        const shareLinkRef = doc(collection(firestore, 'shareLinks'));
        batch.set(shareLinkRef, {
            badgeId: badgeId,
            ownerId: user.uid,
            used: false,
            claimedBy: null,
            createdAt: serverTimestamp(),
        });

        // 2. Create a notification for the recipient
        const notificationRef = doc(collection(firestore, `users/${toUserId}/notifications`));
        batch.set(notificationRef, {
            type: 'BADGE_RECEIVED',
            fromUserId: user.uid,
            badgeId: badgeId,
            createdAt: serverTimestamp(),
            read: false,
            shareLinkId: shareLinkRef.id
        });

        await batch.commit();
        
        toast({
            title: 'Code Sent!',
            description: `A share code has been sent to ${toUserName}.`
        });
    } catch (error) {
        console.error("Error sending code: ", error);
        toast({ title: 'Could not send code', variant: 'destructive'});
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
  const received = notifications?.filter((n) => n.type === 'BADGE_RECEIVED' || n.type === 'OWNERSHIP_TRANSFER') || [];

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
                      {requests.map(n => <NotificationItem key={n.id} notification={n} onSendCode={handleSendCode} />)}
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
                      {received.map(n => <NotificationItem key={n.id} notification={n} onSendCode={handleSendCode} />)}
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
    </>
  );
}

    