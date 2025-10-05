'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNavBar } from '@/components/layout/bottom-nav';
import { AppStateProvider } from '@/components/providers/state-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth({ required: true });

  if (loading || !user) {
    return (
       <div className="flex min-h-screen w-full">
        <div className="hidden md:block">
           <Skeleton className="h-screen w-64" />
        </div>
        <main className="flex-1 flex flex-col">
            <Skeleton className="h-16 w-full" />
            <div className="flex-1 space-y-8 p-4 md:p-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}
