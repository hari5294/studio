
'use client';

import { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { getNotificationsForUser, markNotificationAsRead, getBadgeById, getUserById, type Notification, type Badge, type User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon } from 'lucide-react';
import { useIsClient } from '@/hooks/use-is-client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function NotificationItem({ notification }: { notification: FullNotification }) {
    const router = useRouter();
    
    const handleSendCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to the badge page and open the share dialog
        router.push(`/dashboard/badge/${notification.badge.id}?showShare=true`);
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

type FullNotification = Notification & { fromUser: User; badge: Badge; };

export default function InboxPage() {
  const isClient = useIsClient();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [notifications, setNotifications] = useState<FullNotification[]>([]);
  
  const currentUserId = 'user-1';

  useEffect(() => {
    if (isClient) {
      const userNotifications = getNotificationsForUser(currentUserId);
      const enrichedNotifications = userNotifications
        .map(n => {
            // Mark as read when fetched
            markNotificationAsRead(n.id, currentUserId);
            const fromUser = getUserById(n.fromUserId);
            const badge = getBadgeById(n.badgeId);
            if (!fromUser || !badge) return null;
            return { ...n, fromUser, badge };
        })
        .filter(Boolean) as FullNotification[];
      
      setNotifications(enrichedNotifications);
      forceUpdate(); // To trigger re-render in sidebar after marking as read
    }
  }, [isClient]);

  const requests = notifications.filter(n => n.type === 'BADGE_REQUEST');
  const received = notifications.filter(n => n.type === 'BADGE_RECEIVED');

  return (
    <>
      <Header title="Inbox" />
      <div className="flex-1 p-4 md:p-8">
        {isClient && notifications.length > 0 ? (
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
                        <CardContent className="space-y-2">
                           {requests.length > 0 ? requests.map(n => <NotificationItem key={n.id} notification={n} />) : <p className="text-center text-muted-foreground py-8">No badge requests yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Received Badges</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {received.length > 0 ? received.map(n => <NotificationItem key={n.id} notification={n} />) : <p className="text-center text-muted-foreground py-8">You haven't received any new badges.</p>}
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
