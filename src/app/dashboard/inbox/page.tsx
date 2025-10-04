'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { markNotificationAsRead, type Notification, type Badge, type User } from '@/lib/firestore-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon } from 'lucide-react';
import { useUser, useCollection, useFirestore, useDoc } from '@/firebase';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { collection, doc, query, orderBy, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type EnrichedNotification = Notification & {
    fromUser?: User;
    badge?: Badge;
}

function NotificationItem({ notification }: { notification: EnrichedNotification }) {
    const router = useRouter();
    const { user } = useUser();
    
    const handleSendCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.badge?.id) {
            router.push(`/dashboard/badge/${notification.badge.id}?showShare=true`);
        }
    }
    
    if (!notification.fromUser || !notification.badge) {
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
                    <Link href={`/dashboard/profile/${notification.fromUser.id}`} className="font-bold hover:underline">{notification.fromUser.name}</Link>
                    {' '} requested a code for your {' '}
                    <Link href={`/dashboard/badge/${notification.badge.id}`} className="font-bold hover:underline">{notification.badge.name}</Link> badge.
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
                    <Link href={`/dashboard/profile/${notification.fromUser.id}`} className="font-bold hover:underline">{notification.fromUser.name}</Link>
                    {' '} sent you the {' '}
                    <Link href={`/dashboard/badge/${notification.badge.id}`} className="font-bold hover:underline">{notification.badge.name}</Link> badge!
                </p>
            ),
            action: (
                <Button size="sm" variant="secondary" asChild>
                    <Link href={`/dashboard/badge/${notification.badge.id}`}>
                        View Badge <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            )
        }
    }
    
    const { icon, title, action } = itemContent[notification.type];

    // Mark as read when the component mounts
    useEffect(() => {
        if (user && !notification.read) {
            markNotificationAsRead(notification.id, user.uid);
        }
    }, [notification, user]);

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

function NotificationList({ notifications }: { notifications: EnrichedNotification[] }) {
    const firestore = useFirestore();
    const [enrichedNotifications, setEnrichedNotifications] = useState<EnrichedNotification[]>(notifications);

    useEffect(() => {
        const enrich = async () => {
            const enriched = await Promise.all(notifications.map(async (n) => {
                if (n.fromUser && n.badge) return n; // Already enriched

                const fromUserDoc = doc(firestore, 'users', n.fromUserId);
                const badgeDoc = doc(firestore, 'badges', n.badgeId);

                const [fromUserSnap, badgeSnap] = await Promise.all([
                    getDoc(fromUserDoc),
                    getDoc(badgeDoc)
                ]);

                return {
                    ...n,
                    fromUser: fromUserSnap.exists() ? fromUserSnap.data() as User : undefined,
                    badge: badgeSnap.exists() ? badgeSnap.data() as Badge : undefined,
                }
            }));
            setEnrichedNotifications(enriched);
        }
        enrich();
    }, [notifications, firestore]);
    
    if (enrichedNotifications.length === 0) {
         return <p className="text-center text-muted-foreground py-8">No notifications here.</p>
    }

    return (
        <div className="space-y-2">
            {enrichedNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
        </div>
    )
}


export default function InboxPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const notificationsQuery = user 
    ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'))
    : null;
    
  const { data: notifications, loading: notificationsLoading } = useCollection<Notification>(notificationsQuery);
  
  const loading = userLoading || notificationsLoading;

  const requests = notifications?.filter(n => n.type === 'BADGE_REQUEST') ?? [];
  const received = notifications?.filter(n => n.type === 'BADGE_RECEIVED') ?? [];

  if (loading) {
      return (
        <div className="flex-1 p-4 md:p-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
      )
  }

  return (
    <>
      <Header title="Inbox" />
      <div className="flex-1 p-4 md:p-6">
        {notifications && notifications.length > 0 ? (
            <Tabs defaultValue="requests" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">
                        Badge Requests ({requests.length})
                    </TabsTrigger>
                    <TabsTrigger value="received">
                        Received Badges ({received.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Badge Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {requests.length > 0 ? <NotificationList notifications={requests} /> : <p className="text-center text-muted-foreground py-8">No badge requests yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Received Badges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {received.length > 0 ? <NotificationList notifications={received} /> : <p className="text-center text-muted-foreground py-8">You haven't received any new badges.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
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
