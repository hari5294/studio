
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Gift, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useMockData } from '@/hooks/use-mock-data';
import { useMemo } from 'react';

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
  const { notifications } = useMockData();
  
  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return notifications.filter(n => n.toUserId === user.id && !n.read).length;
  }, [user, notifications]);

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
