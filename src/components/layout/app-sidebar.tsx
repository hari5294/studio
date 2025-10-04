'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  PlusCircle,
  User,
  MoreHorizontal,
  Search,
  Gift,
  Inbox
} from 'lucide-react';
import { EmojiBadgeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { usersAtom, badgesAtom, currentUserIdAtom, notificationsAtom } from '@/lib/mock-data';

function OwnedBadges() {
    const pathname = usePathname();
    const [currentUserId] = useAtom(currentUserIdAtom);
    const [allBadges] = useAtom(badgesAtom);
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const ownedBadges = Object.values(allBadges).filter(b => b.owners.includes(currentUserId));
    
    if (ownedBadges.length === 0) return null;

    return (
        <div className="mt-4 flex flex-col gap-2 p-2 pt-0">
            <p className="px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                Owned Badges
            </p>
            <SidebarMenu>
                {ownedBadges.slice(0, 5).map((badge) => ( // Limit to 5 for tidiness
                <SidebarMenuItem key={badge.id}>
                    <SidebarMenuButton
                    asChild
                    isActive={isActive(`/dashboard/badge/${badge.id}`)}
                    tooltip={badge.name}
                    >
                    <Link href={`/dashboard/badge/${badge.id}`}>
                        <span className="text-lg">{badge.emojis}</span>
                        <span>{badge.name}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
    )
}

function UserMenu() {
    const [currentUserId, setCurrentUserId] = useAtom(currentUserIdAtom);
    const [users] = useAtom(usersAtom);
    const currentUser = users[currentUserId];

    if (!currentUser) return null;

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'flex h-auto w-full items-center justify-start gap-2 p-2 text-left',
                'group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'
              )}
            >
              <Avatar className="h-8 w-8">
                {currentUser.emojiAvatar ? (
                  <span className="flex h-full w-full items-center justify-center text-xl">{currentUser.emojiAvatar}</span>
                ) : (
                  <AvatarFallback>{currentUser.name?.charAt(0) ?? '?'}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-grow truncate group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <MoreHorizontal className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/profile/${currentUser.id}`}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

function InboxMenuLink() {
    const pathname = usePathname();
    const [allNotifications] = useAtom(notificationsAtom);
    const [currentUserId] = useAtom(currentUserIdAtom);
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
    
    const unreadCount = Object.values(allNotifications).filter(n => n.userId === currentUserId && !n.read).length;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/inbox')}
              tooltip="Inbox"
            >
              <Link href="/dashboard/inbox" className="relative">
                <Inbox />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:top-0">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
    )
}


export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [currentUserId] = useAtom(currentUserIdAtom);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="h-16 justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <EmojiBadgeLogo className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">EmojiBadge</span>
        </div>
        {!isMobile && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/search')}
              tooltip="Search"
            >
              <Link href="/dashboard/search">
                <Search />
                <span>Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/redeem')}
              tooltip="Redeem Code"
            >
              <Link href="/dashboard/redeem">
                <Gift />
                <span>Redeem Code</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <InboxMenuLink />

          <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive(`/dashboard/profile/${currentUserId}`)}
                tooltip="My Profile"
            >
                <Link href={`/dashboard/profile`}>
                    <User />
                    <span>My Profile</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/create')}
              tooltip="Create Badge"
            >
              <Link href="/dashboard/create">
                <PlusCircle />
                <span>Create Badge</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <OwnedBadges />

      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
