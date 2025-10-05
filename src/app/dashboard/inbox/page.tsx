
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Gift, Inbox as InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMockData, User, Badge, Notification } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

type EnrichedNotification = Notification & { fromUser: User; badge: Badge };

function NotificationItem({ notification, onSendCode }: { notification: EnrichedNotification, onSendCode: (badgeId: string, fromUserId: string, fromUserName: string) => void }) {
    const { markNotificationAsRead } = useMockData();
    const router = useRouter();

    const handleSendCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.badge?.id && notification.fromUser?.id) {
            onSendCode(notification.badge.id, notification.fromUser.id, notification.fromUser.name);
        }
    }

    useEffect(() => {
        if (!notification.read) {
            const timer = setTimeout(() => {
                markNotificationAsRead(notification.id);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [notification.id, notification.read, markNotificationAsRead]);

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
                    {' '} sent you a code for the {' '}
                    <Link href={`/dashboard/badge/${notification.badge.id}`} className="font-bold hover:underline">{notification.badge.name}</Link> badge!
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
                    <Link href={`/dashboard/badge/${notification.badge.id}`} className="font-bold hover:underline">{notification.badge.name}</Link> badge has been transferred to you!
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

function NotificationList({ notifications, onSendCode }: { notifications: EnrichedNotification[], onSendCode: (badgeId: string, fromUserId: string, fromUserName: string) => void }) {
    if (notifications.length === 0) {
         return <p className="text-center text-muted-foreground py-8">No notifications here.</p>
    }

    return (
        <div className="space-y-2">
            {notifications.map(n => <NotificationItem key={n.id} notification={n} onSendCode={onSendCode} />)}
        </div>
    )
}

export default function InboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { users, badges, notifications, addNotification, createShareLink, loading } = useMockData();
  const [key, setKey] = useState(Date.now()); // to force re-render

  const enrichNotifications = (notifs: Notification[]) => {
    return notifs
        .map(n => {
            const fromUser = users.find(u => u.id === n.fromUserId);
            const badge = badges.find(b => b.id === n.badgeId);
            return fromUser && badge ? { ...n, fromUser, badge } : null;
        })
        .filter((n): n is EnrichedNotification => n !== null)
        .sort((a, b) => b.createdAt - a.createdAt);
  }

  const handleSendCode = (badgeId: string, fromUserId: string, fromUserName: string) => {
    if (!user) return;
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) return;

    const link = createShareLink({ badgeId, ownerId: user.id });
    addNotification({
        userId: fromUserId,
        fromUserId: user.id,
        badgeId,
        type: 'BADGE_RECEIVED',
        shareLinkId: link.id,
    });
    toast({
        title: 'Code Sent!',
        description: `A share code for "${badge.name}" has been sent to ${fromUserName}.`
    });
    setKey(Date.now()); // Re-render to update lists
  }
  
  if (loading) {
      return (
        <div className="flex-1 p-4 md:p-6">
            <Header title="Inbox" />
            <Skeleton className="h-10 w-full mb-4 max-w-sm mx-auto" />
            <Skeleton className="h-64 w-full max-w-4xl mx-auto" />
        </div>
      )
  }

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const requests = enrichNotifications(userNotifications.filter(n => n.type === 'BADGE_REQUEST'));
  const received = enrichNotifications(userNotifications.filter(n => n.type === 'BADGE_RECEIVED' || n.type === 'OWNERSHIP_TRANSFER'));

  return (
    <>
      <Header title="Inbox" />
      <div className="flex-1 p-4 md:p-6">
        {userNotifications.length > 0 ? (
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
                           {requests.length > 0 ? <NotificationList notifications={requests} onSendCode={handleSendCode}/> : <p className="text-center text-muted-foreground py-8">No badge requests yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {received.length > 0 ? <NotificationList notifications={received} onSendCode={handleSendCode} /> : <p className="text-center text-muted-foreground py-8">You haven't received any new badges.</p>}
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
