'use client';

import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { useAuth } from '@/hooks/use-auth';
import { Badge as BadgeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder Data
const myBadges = [
  { id: 'b1', name: 'Galactic Pioneer', emojis: '🌌🚀✨', tokens: 50, owners: {length: 2}, followers: {length: 3}},
  { id: 'b3', name: 'Code Ninja', emojis: '💻🥋🥷', tokens: 1000, owners: {length: 1}, followers: {length: 2}},
];

function MyBadges() {
  const { user, loading } = useAuth();

  if (loading) {
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
            <BadgeCard key={badge.id} badge={badge as any} />
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
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
            <BadgeIcon className="h-6 w-6" />
            My Badges
          </h2>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
