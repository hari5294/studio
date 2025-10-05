'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge as BadgeIcon, Users, Search as SearchIcon } from 'lucide-react';
import { BadgeCard } from '@/components/badges/badge-card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Badge } from '@/lib/mock-data';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const firestore = useFirestore();

  const badgesQuery = useMemo(() => {
    if (!firestore || !queryParam) return null;
    return query(
        collection(firestore, 'badges'), 
        where('name', '>=', queryParam),
        where('name', '<=', queryParam + '\uf8ff'),
        limit(20)
    );
  }, [firestore, queryParam]);

  const usersQuery = useMemo(() => {
    if (!firestore || !queryParam) return null;
     return query(
        collection(firestore, 'users'), 
        where('name', '>=', queryParam),
        where('name', '<=', queryParam + '\uf8ff'),
        limit(20)
    );
  }, [firestore, queryParam]);

  const { data: badgeResults, loading: badgesLoading } = useCollection<Badge>(badgesQuery);
  const { data: userResults, loading: usersLoading } = useCollection<User>(usersQuery);

  const loading = badgesLoading || usersLoading;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {!queryParam && (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold font-headline">Search for Badges or Users</h2>
            <p className="mt-2 text-muted-foreground">
                Use the search bar above to find content.
            </p>
        </div>
      )}

      {queryParam && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <BadgeIcon className="h-6 w-6" />
              Badges ({badgeResults?.length || 0})
            </h2>
            {loading ? <Skeleton className="h-48 w-full" /> : badgeResults && badgeResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {badgeResults.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No badges found for &quot;{queryParam}&quot;.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <Users className="h-6 w-6" />
              Users ({userResults?.length || 0})
            </h2>
            {loading ? <Skeleton className="h-24 w-full" /> : userResults && userResults.length > 0 ? (
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
                <p className="text-muted-foreground">No users found for &quot;{queryParam}&quot;.</p>
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
