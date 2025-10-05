
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Badge, Notification } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/components/providers/sound-provider';
import { useAuth, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, updateDoc, addDoc, writeBatch } from 'firebase/firestore';


type EnrichedNotification = Notification & { fromUser?: User; badge?: Badge };

function NotificationItem({ notification, onUpdate }: { notification: EnrichedNotification, onUpdate: () => void }) {
    const { toast } = useToast();
    const { playSound } = useSound();
    const { user: currentUser } = useAuth();
    const firestore = useFirestore();
    
    const handleSendCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.badge?.id && notification.fromUser?.id && currentUser && firestore) {
            
            const batch = writeBatch(firestore);

            const newLinkRef = doc(collection(firestore, 'shareLinks'));
            const newLink = {
                badgeId: notification.badgeId,
                ownerId: currentUser.id,
                used: false,
                claimedBy: null,
                createdAt: Date.now()
            };
            batch.set(newLinkRef, newLink);

            const newNotificationRef = doc(collection(firestore, 'users', notification.fromUserId, 'notifications'));
            const newNotification = {
                type: 'BADGE_RECEIVED',
                userId: notification.fromUserId,
                fromUserId: currentUser.id,
                badgeId: notification.badgeId,
                createdAt: Date.now(),
                read: false,
                shareLinkId: newLinkRef.id,
            };
            batch.set(newNotificationRef, newNotification);

            await batch.commit();

            toast({
                title: 'Code Sent!',
                description: `A share code for "${notification.badge.name}" has been sent to ${notification.fromUser.name}.`
            });
            playSound('notification');
        }
    }

    useEffect(() => {
        if (!notification.read && firestore && currentUser) {
            const timer = setTimeout(async () => {
                const notifRef = doc(firestore, 'users', currentUser.id, 'notifications', notification.id);
                await updateDoc(notifRef, { read: true });
                onUpdate();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [notification, firestore, currentUser, onUpdate]);
    
    const { data: fromUser } = useDoc<User>(firestore && notification.fromUserId ? doc(firestore, 'users', notification.fromUserId) : null);
    const { data: badge } = useDoc<Badge>(firestore && notification.badgeId ? doc(firestore, 'badges', notification.badgeId) : null);

    if (!fromUser || !badge) {
        return (
            <div className="flex items-start gap-4 p-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-24" />
            </div>
        )
    }
    
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
    }
    
    const { icon, title, action } = itemContent[notification.type];

    return (
        <div className={cn(
            "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50",
            !notification.read && "bg-muted"
        )}>
            <div className="pt-1">{icon}</div>
            <div className="flex-grow space-y-1">
                <div className="text-sm">{title}</div>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
            <div className="flex items-center">{action}</div>
        </div>
    )
}

function NotificationList({ notifications, onNotificationUpdate }: { notifications: Notification[], onNotificationUpdate: () => void }) {
    if (notifications.length === 0) {
         return <p className="text-center text-muted-foreground py-8">No notifications here.</p>
    }

    return (
        <div className="space-y-2">
            {notifications.sort((a,b) => b.createdAt - a.createdAt).map(n => <NotificationItem key={n.id} notification={n} onUpdate={onNotificationUpdate} />)}
        </div>
    )
}

export default function InboxPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [key, setKey] = useState(Date.now());

  const notificationsQuery = useMemo(() => {
    if (!firestore || !user?.id) return null;
    return query(collection(firestore, 'users', user.id, 'notifications'));
  }, [firestore, user?.id]);

  const { data: userNotifications, loading } = useCollection<Notification>(notificationsQuery);
  
  const handleNotificationUpdate = () => {
      setKey(Date.now());
  }

  const requests = userNotifications?.filter(n => n.type === 'BADGE_REQUEST') ?? [];
  const received = userNotifications?.filter(n => n.type === 'BADGE_RECEIVED' || n.type === 'OWNERSHIP_TRANSFER') ?? [];

  if (loading) {
      return (
        <div className="flex-1 p-4 md:p-6">
            <Header title="Inbox" />
            <Skeleton className="h-10 w-full mb-4 max-w-sm mx-auto" />
            <Skeleton className="h-64 w-full max-w-4xl mx-auto" />
        </div>
      )
  }

  return (
    <>
      <Header title="Inbox" />
      <div className="flex-1 p-4 md:p-6">
        {userNotifications && userNotifications.length > 0 ? (
            <Tabs defaultValue="requests" className="w-full max-w-4xl mx-auto" key={key}>
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
                           {requests.length > 0 ? <NotificationList notifications={requests} onNotificationUpdate={handleNotificationUpdate} /> : <p className="text-center text-muted-foreground py-8">No badge requests yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {received.length > 0 ? <NotificationList notifications={received} onNotificationUpdate={handleNotificationUpdate} /> : <p className="text-center text-muted-foreground py-8">You haven't received any new badges.</p>}
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
