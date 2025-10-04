import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNavBar } from '@/components/layout/bottom-nav';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
