
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
import { firestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

type BadgeType = {
    id: string;
    name: string;
    emojis: string;
    tokens: number;
    owners: any[];
    followers: any[];
};
type UserType = {
    id: string;
    name: string;
    email: string;
    emojiAvatar?: string;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [badgeResults, setBadgeResults] = useState<BadgeType[]>([]);
  const [userResults, setUserResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
        if (!q) {
            setBadgeResults([]);
            setUserResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const lowerCaseQuery = q.toLowerCase();

        try {
            // Search Badges
            const badgesRef = collection(firestore, 'badges');
            // Firestore doesn't support case-insensitive `includes` search directly.
            // A common approach is to search for a range.
            const badgeQuery = query(
                badgesRef,
                where('name', '>=', q),
                where('name', '<=', q + '\uf8ff'),
                limit(20)
            );
            const badgeSnap = await getDocs(badgeQuery);
            
            const badgePromises = badgeSnap.docs.map(async (doc) => {
                 const badgeData = { id: doc.id, ...doc.data() };
                 const ownersRef = collection(firestore, `badges/${doc.id}/owners`);
                 const followersRef = collection(firestore, `badges/${doc.id}/followers`);
                 const [ownersSnap, followersSnap] = await Promise.all([
                     getDocs(ownersRef),
                     getDocs(followersRef)
                 ]);
                 return {
                     ...badgeData,
                     owners: ownersSnap.docs.map(d => d.data()),
                     followers: followersSnap.docs.map(d => d.data()),
                 } as BadgeType;
            });
            const badges = await Promise.all(badgePromises);
            setBadgeResults(badges.filter(b => b.name.toLowerCase().includes(lowerCaseQuery)));


            // Search Users
            const usersRef = collection(firestore, 'users');
            const userQuery = query(
                usersRef,
                where('name', '>=', q),
                where('name', '<=', q + '\uf8ff'),
                limit(20)
            );
            const userSnap = await getDocs(userQuery);
            const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
            setUserResults(users.filter(u => u.name.toLowerCase().includes(lowerCaseQuery)));

        } catch (error) {
            console.error("Error searching:", error);
            // Optionally set an error state and show a toast
        } finally {
            setLoading(false);
        }
    };

    performSearch();
  }, [q]);

  const renderSkeletons = (count: number, className: string) => (
    Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={className} />)
  )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {!q && (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold font-headline">Search for Badges or Users</h2>
            <p className="mt-2 text-muted-foreground">
                Use the search bar above to find content.
            </p>
        </div>
      )}

      {q && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <BadgeIcon className="h-6 w-6" />
              Badges ({loading ? '...' : badgeResults.length})
            </h2>
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {renderSkeletons(4, "h-48 w-full")}
                </div>
            ) : badgeResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {badgeResults.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No badges found for &quot;{q}&quot;.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
              <Users className="h-6 w-6" />
              Users ({loading ? '...' : userResults.length})
            </h2>
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {renderSkeletons(3, "h-20 w-full")}
                </div>
            ) : userResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userResults.map((user) => (
                  <Link href={`/dashboard/profile/${user.id}`} key={user.id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                           {user.emojiAvatar ? (
                                <span className="flex h-full w-full items-center justify-center text-3xl">{user.emojiAvatar}</span>
                           ) : (
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
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
                <p className="text-muted-foreground">No users found for &quot;{q}&quot;.</p>
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

    