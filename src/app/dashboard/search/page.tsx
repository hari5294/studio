
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { searchBadges, searchUsers, type Badge, type User } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge as BadgeIcon, Users, Search as SearchIcon } from 'lucide-react';
import { BadgeCard } from '@/components/badges/badge-card';
import { getUserById } from '@/lib/data';


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const badgeResults: Badge[] = query ? searchBadges(query) : [];
  const userResults: User[] = query ? searchUsers(query) : [];

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
            {badgeResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {badgeResults.map((badge) => {
                   const followersData = badge.followers.map((id) => getUserById(id)).filter(Boolean) as User[];
                   return <BadgeCard key={badge.id} badge={badge} followersData={followersData} />;
                })}
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
            {userResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userResults.map((user) => (
                  <Link href={`/dashboard/profile/${user.id}`} key={user.id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                           {user.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-3xl">{user.emojiAvatar}</span>
                           ) : (
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                           )}
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
      <Suspense fallback={<div>Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </>
  );
}
