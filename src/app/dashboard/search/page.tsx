'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge as BadgeIcon, Users, Search as SearchIcon } from 'lucide-react';
import { BadgeCard } from '@/components/badges/badge-card';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder Data
const allBadges = [
    { id: 'b1', name: 'Galactic Pioneer', emojis: '🌌🚀✨', tokens: 50, owners: {length: 2}, followers: {length: 3}},
    { id: 'b2', name: 'Pixel Perfect', emojis: '🎨🖼️🖌️', tokens: 250, owners: {length: 1}, followers: {length: 2}},
    { id: 'b3', name: 'Code Ninja', emojis: '💻🥋🥷', tokens: 1000, owners: {length: 1}, followers: {length: 2}},
    { id: 'b4', name: 'Super Squad', emojis: '🦸‍♀️🦸‍♂️💥', tokens: 100, owners: {length: 1}, followers: {length: 1}},
];
const allUsers = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', emojiAvatar: '👩‍💻' },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', emojiAvatar: '👨‍🎨' },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', emojiAvatar: '👨‍🚀' },
    { id: 'u4', name: 'Diana', email: 'diana@example.com', emojiAvatar: '🦸‍♀️' },
];


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const loading = false;
  const [badgeResults, setBadgeResults] = useState(allBadges as any[]);
  const [userResults, setUserResults] = useState(allUsers as any[]);

  useEffect(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      setBadgeResults(allBadges.filter(b => b.name.toLowerCase().includes(lowerCaseQuery)));
      setUserResults(allUsers.filter(u => u.name.toLowerCase().includes(lowerCaseQuery)));
    } else {
      setBadgeResults([]);
      setUserResults([]);
    }
  }, [query]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {!query && (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold font-headline">Search for Badges or Users</h2>
            <p className="mt-2 text-muted-foreground">
                Use the search bar above to find content.
            </p>
        </div>
      )}

      {query && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <BadgeIcon className="h-6 w-6" />
              Badges ({badgeResults.length})
            </h2>
            {loading ? <Skeleton className="h-48 w-full" /> : badgeResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {badgeResults.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No badges found for &quot;{query}&quot;.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <Users className="h-6 w-6" />
              Users ({userResults.length})
            </h2>
            {loading ? <Skeleton className="h-24 w-full" /> : userResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userResults.map((user) => (
                  <Link href={`/dashboard/profile/${user.id}`} key={user.id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                           {user.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-3xl">{user.emojiAvatar}</span>
                           ) : (
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                           )}
                        </Avatar>
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">View Profile</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No users found for &quot;{query}&quot;.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
  return (
    <>
      <Header title={query ? `Results for "${query}"` : 'Search'} />
      <Suspense fallback={<div className="p-6">Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </>
  );
}
