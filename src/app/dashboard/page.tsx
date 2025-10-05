
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { useAuth } from '@/hooks/use-auth';
import { Badge as BadgeIcon, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMockData } from '@/hooks/use-mock-data';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

function MyBadges() {
  const { user, loading: authLoading } = useAuth();
  const { badges, badgeOwners, getBadgeWithDetails } = useMockData();

  const myBadges = useMemo(() => {
    if (!user) return [];
    const myBadgeIds = badgeOwners.filter(bo => bo.userId === user.id).map(bo => bo.badgeId);
    return badges
      .filter(b => myBadgeIds.includes(b.id))
      .map(b => getBadgeWithDetails(b.id))
      .filter(Boolean);
  }, [user, badges, badgeOwners, getBadgeWithDetails]);


  if (authLoading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

  return (
    <>
      {myBadges.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven&apos;t created or claimed any badges yet.</p>
        </div>
      )}
    </>
  );
}


export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-8 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold font-headline">
                <BadgeIcon className="h-6 w-6" />
                My Badges
            </h2>
             <Button asChild variant="outline">
                <Link href="/dashboard/redeem">
                    <Gift className="mr-2 h-4 w-4" /> Redeem Code
                </Link>
            </Button>
        </div>
        <div>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
