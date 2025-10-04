'use client';

import { Header } from '@/components/layout/header';
import { BadgeCard } from '@/components/badges/badge-card';
import { TrendingBadges } from '@/components/badges/trending-badges';
import { Badge } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
const mockBadges = [
  { id: '1', name: 'Cosmic Explorer', emojis: '🚀✨', tokens: 1000, owners: ['1', '2', '3'], followers: ['1', '2', '3', '4', '5'], createdAt: Date.now(), ownerId: '1' },
  { id: '2', name: 'Ocean Diver', emojis: '🌊🐠', tokens: 500, owners: ['1'], followers: ['2', '3'], createdAt: Date.now(), ownerId: '2' },
  { id: '3', name: 'Pixel Artist', emojis: '🎨👾', tokens: 100, owners: [], followers: [], createdAt: Date.now(), ownerId: '3' },
];


function MyBadges() {
  const myBadges = mockBadges.slice(0, 2); // Mock: user owns first two badges
  const loading = false;

  if (loading) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
    );
  }

  return (
    <>
      {myBadges && myBadges.length > 0 ? (
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
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
            <Badge className="h-6 w-6" />
            My Badges
          </h2>
          <MyBadges />
        </div>
        <TrendingBadges />
      </div>
    </>
  );
}
