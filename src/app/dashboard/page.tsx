
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { getBadgesByOwner, getUserById, type Badge as BadgeType } from '@/lib/data';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { Badge } from 'lucide-react';
import { useIsClient } from '@/hooks/use-is-client';

export default function DashboardPage() {
  const isClient = useIsClient();
  const [myBadges, setMyBadges] = useState<BadgeType[]>([]);

  useEffect(() => {
    if (isClient) {
      const userBadges = getBadgesByOwner('user-1');
      setMyBadges(userBadges);
    }
  }, [isClient]);
  

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
            <Badge className="h-6 w-6" />
            My Badges
          </h2>
          {isClient && myBadges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myBadges.map((badge) => {
                const followersData =
                  badge.followers
                    .map((id) => getUserById(id))
                    .filter(Boolean) ?? [];
                // @ts-ignore
                return <BadgeCard key={badge.id} badge={badge} followersData={followersData} />;
              })}
            </div>
          ) : (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You haven&apos;t created or claimed any badges yet.</p>
             </div>
          )}
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
