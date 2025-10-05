'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Gift, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { Notification } from '@/lib/mock-data';


const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home', exact: true },
  { href: '/dashboard/search', icon: Search, label: 'Search' },
  { href: '/dashboard/redeem', icon: Gift, label: 'Redeem' },
  { href: '/dashboard/inbox', icon: Inbox, label: 'Inbox', requiresNotification: true },
  { href: '/dashboard/profile', icon: User, label: 'Profile', isProfile: true },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!firestore || !user?.id) return null;
    return query(collection(firestore, 'users', user.id, 'notifications'), where('read', '==', false));
  }, [firestore, user?.id]);

  const { data: unreadNotifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = unreadNotifications?.length ?? 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card/95 backdrop-blur-sm z-40">
      <nav className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const href = item.isProfile && user ? `/dashboard/profile/${user.id}` : item.href;
          const isActive = item.exact ? pathname === href : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.requiresNotification && unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
