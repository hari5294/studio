
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  Inbox,
  LogIn,
  LogOut,
} from 'lucide-react';
import { EmojiBadgeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useUser, useCollection, firestore } from '@/firebase';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';


function OwnedBadges() {
    const pathname = usePathname();
    const { user } = useUser();
    const { isMobile, setOpenMobile } = useSidebar();
    
    const [ownedBadges, setOwnedBadges] = useState<any[]>([]);
    
    const badgeOwnersQuery = user ? query(collection(firestore, 'badgeOwners'), where('userId', '==', user.uid)) : null;

    useEffect(() => {
        if (!badgeOwnersQuery) {
            setOwnedBadges([]);
            return;
        };

        const fetchBadges = async () => {
            const ownersSnap = await getDocs(badgeOwnersQuery);
            const badgeIds = ownersSnap.docs.map(doc => doc.data().badgeId);
            
            if (badgeIds.length > 0) {
                const badgesQuery = query(collection(firestore, 'badges'), where('__name__', 'in', badgeIds));
                const badgesSnap = await getDocs(badgesQuery);
                const badges = badgesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOwnedBadges(badges);
            } else {
                setOwnedBadges([]);
            }
        };

        fetchBadges();
    }, [badgeOwnersQuery]);


    if (!ownedBadges || ownedBadges.length === 0) return null;

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const handleClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

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
                    onClick={handleClick}
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
    const { user, loading } = useUser();
    const auth = getAuth();
    
    if (loading) {
        return null;
    };

    if (!user) {
        return (
             <Button
              variant="ghost"
              className='flex h-auto w-full items-center justify-start gap-2 p-2 text-left'
              asChild
            >
                <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4 shrink-0"/>
                    <span className="group-data-[collapsible=icon]:hidden">Login</span>
                </Link>
            </Button>
        )
    }

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
                {user.emojiAvatar ? (
                  <span className="flex h-full w-full items-center justify-center text-xl">{user.emojiAvatar}</span>
                ) : (
                  <AvatarFallback>{user.name?.charAt(0) ?? '?'}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-grow truncate group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <MoreHorizontal className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/profile/${user.uid}`}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

function InboxMenuLink() {
    const pathname = usePathname();
    const { user } = useUser();
    const { isMobile, setOpenMobile } = useSidebar();
    
    const notificationsQuery = user ? query(collection(firestore, `users/${user.uid}/notifications`), where('read', '==', false)) : null;
    const { data: unreadNotifications } = useCollection(notificationsQuery);
    const unreadCount = unreadNotifications?.length || 0;

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const handleClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/inbox')}
              tooltip="Inbox"
              onClick={handleClick}
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
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useUser();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      {isMobile && (
        <SheetHeader className="p-4 border-b">
          <SheetTitle>EmojiBadge</SheetTitle>
          <SheetDescription>Navigation Menu</SheetDescription>
        </SheetHeader>
      )}
      <SidebarHeader className="h-16 justify-between border-b px-3">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleClick}>
          <EmojiBadgeLogo className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">EmojiBadge</span>
        </Link>
        {!isMobile && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Dashboard"
              onClick={handleClick}
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
              onClick={handleClick}
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
              disabled={!user}
              onClick={handleClick}
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
                isActive={isActive(`/dashboard/profile`)}
                tooltip="My Profile"
                disabled={!user}
                onClick={handleClick}
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
               disabled={!user}
               onClick={handleClick}
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

    