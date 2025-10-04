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
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
type User = { id: string; name: string; };
type Badge = { id: string; name: string; };
type Notification = { id: string; type: 'BADGE_REQUEST' | 'BADGE_RECEIVED'; fromUserId: string; badgeId: string; createdAt: number; read: boolean; fromUser?: User; badge?: Badge; };

const mockUsers = {
    '123': { id: '123', name: 'John Doe' },
    '456': { id: '456', name: 'Jane Smith' },
    '789': { id: '789', name: 'Alex Ray' },
};

const mockBadges = {
    '1': { id: '1', name: 'Cosmic Explorer' },
    '2': { id: '2', name: 'Ocean Diver' },
};

const mockNotifications: Notification[] = [
    { id: 'n1', type: 'BADGE_REQUEST', fromUserId: '456', badgeId: '1', createdAt: new Date(Date.now() - 1000 * 60 * 5).getTime(), read: false },
    { id: 'n2', type: 'BADGE_RECEIVED', fromUserId: '123', badgeId: '2', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).getTime(), read: false },
    { id: 'n3', type: 'BADGE_REQUEST', fromUserId: '789', badgeId: '1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).getTime(), read: true },
];

function NotificationItem({ notification: initialNotification }: { notification: Notification }) {
    const router = useRouter();
    const [notification, setNotification] = useState(initialNotification);
    
    const handleSendCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (notification.badge?.id) {
            router.push(`/dashboard/badge/${notification.badge.id}?showShare=true`);
        }
    }

    useEffect(() => {
        // Mark as read when the component mounts
        if (!notification.read) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, read: true }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [notification.read]);
    
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

function NotificationList({ notifications }: { notifications: Notification[] }) {
    const [enrichedNotifications, setEnrichedNotifications] = useState<Notification[]>([]);
    
    useEffect(() => {
        const enriched = notifications.map(n => ({
            ...n,
            fromUser: mockUsers[n.fromUserId as keyof typeof mockUsers],
            badge: mockBadges[n.badgeId as keyof typeof mockBadges],
        }));
        setEnrichedNotifications(enriched);
    }, [notifications]);
    
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
      }, 500);
  }, []);

  const requests = notifications?.filter(n => n.type === 'BADGE_REQUEST') ?? [];
  const received = notifications?.filter(n => n.type === 'BADGE_RECEIVED') ?? [];

  if (loading) {
      return (
        <div className="flex-1 p-4 md:p-6">
            <Header title="Inbox" />
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
