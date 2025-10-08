
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeCard } from '@/components/badges/badge-card';
import { Badge, User as UserIcon, Users, Edit, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser, useDoc, firestore } from '@/firebase';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, doc, getDocs, getDoc, updateDoc, arrayUnion, arrayRemove, collectionGroup } from 'firebase/firestore';
import { AppUser } from '@/firebase/auth/use-user';
import type { Badge as BadgeType } from '@/docs/backend-schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type EnrichedUser = AppUser & {
    id: string;
}

function ProfileHeaderCard({ profile, isCurrentUserProfile }: { profile: EnrichedUser, isCurrentUserProfile: boolean }) {
    const { toast } = useToast();
    const { user: currentUser } = useUser();
    const [isEditProfileOpen, setEditProfileOpen] = useState(false);

    if (!currentUser || !profile) return null;

    const isFollowing = currentUser.following?.includes(profile.id);

    const handleFollowToggle = async () => {
        if (profile.id === currentUser.uid) return;
        const currentUserRef = doc(firestore, 'users', currentUser.uid);

        try {
            await updateDoc(currentUserRef, {
                following: isFollowing ? arrayRemove(profile.id) : arrayUnion(profile.id)
            });
            toast({
                title: !isFollowing ? 'Followed!' : 'Unfollowed.',
                description: `You are now ${!isFollowing ? 'following' : 'no longer following'} ${profile.name}.`
            });
        } catch (error) {
            console.error("Error toggling follow:", error);
            toast({ title: "Something went wrong", variant: "destructive" });
        }
    }

    const handleUpdateUser = async (updatedUserData: { emojiAvatar?: string }) => {
        const userRef = doc(firestore, 'users', profile.id);
        try {
            await updateDoc(userRef, updatedUserData);
            toast({
                title: "Avatar Updated!",
                description: `Your profile picture has been updated.`,
            });
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "Update failed", variant: "destructive" });
        }
    };

    return (
        <>
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                 <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        {profile.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-5xl">{profile.emojiAvatar}</span>
                        ) : (
                            <AvatarFallback className="text-3xl">{profile.name?.charAt(0) ?? '?'}</AvatarFallback>
                        )}
                    </Avatar>
                    {isCurrentUserProfile && (
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                            onClick={() => setEditProfileOpen(true)}
                        >
                            <Edit className="h-4 w-4"/>
                        </Button>
                    )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold font-headline">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                 {!isCurrentUserProfile && (
                    <Button variant={isFollowing ? 'secondary' : 'outline'} onClick={handleFollowToggle}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                 )}
              </CardContent>
            </Card>
            {isCurrentUserProfile && (
                <EditProfileDialog 
                    open={isEditProfileOpen} 
                    onOpenChange={setEditProfileOpen} 
                    user={profile}
                    onUpdate={handleUpdateUser}
                />
             )}
        </>
    )
}

function OwnedBadges({ userId }: { userId: string }) {
    const [ownedBadges, setOwnedBadges] = useState<(BadgeType & { id: string, owners: any[], followers: any[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOwnedBadges = async () => {
            setLoading(true);
            setError(null);
            try {
                const ownersQuery = query(collectionGroup(firestore, 'owners'), where('userId', '==', userId));
                const ownersSnapshot = await getDocs(ownersQuery);
                const badgeIds = ownersSnapshot.docs.map(doc => doc.data().badgeId);

                if (badgeIds.length > 0) {
                    const badgeDocs = await Promise.all(
                        [...new Set(badgeIds)].map(id => getDoc(doc(firestore, 'badges', id)))
                    );
                    
                    const badgesData = await Promise.all(badgeDocs.map(async (badgeSnap) => {
                        if (!badgeSnap.exists()) return null;
                        const badgeData = { id: badgeSnap.id, ...badgeSnap.data() } as BadgeType & { id: string };

                        const ownersRef = collection(firestore, `badges/${badgeData.id}/owners`);
                        const followersRef = collection(firestore, `badges/${badgeData.id}/followers`);
                        const [ownersSnap, followersSnap] = await Promise.all([getDocs(ownersRef), getDocs(followersRef)]);

                        return {
                            ...badgeData,
                            owners: ownersSnap.docs.map(d => d.data()),
                            followers: followersSnap.docs.map(d => d.data()),
                        };
                    }));

                    setOwnedBadges(badgesData.filter(Boolean) as (BadgeType & { id: string, owners: any[], followers: any[] })[]);
                } else {
                    setOwnedBadges([]);
                }
            } catch(e: any) {
                console.error(e);
                if (e.code === 'failed-precondition') {
                    setError("The database is getting an upgrade. This user's badges will appear here soon!");
                } else {
                    setError("Could not load this user's badges at this time.");
                }
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchOwnedBadges();
        }
    }, [userId]);

    const renderContent = () => {
        if (loading) {
             return (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            )
        }
        if (error) {
            return (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Could Not Load Badges</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }
        if (ownedBadges.length > 0) {
            return (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ownedBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
                </div>
            );
        }
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">This user hasn&apos;t created or claimed any badges yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold font-headline">
                <Badge className="h-6 w-6" />
                Owned Badges ({loading ? '...' : ownedBadges.length})
            </h2>
            {renderContent()}
        </div>
    )
}

function FollowingList({ user }: { user: EnrichedUser }) {
    const [followingProfiles, setFollowingProfiles] = useState<EnrichedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!user.following || user.following.length === 0) {
                setFollowingProfiles([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('__name__', 'in', user.following));
            const querySnapshot = await getDocs(q);
            const profiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnrichedUser));
            setFollowingProfiles(profiles);
            setLoading(false);
        }
        fetchFollowing();
    }, [user.following]);

     if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Following ({followingProfiles.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {followingProfiles.length > 0 ? followingProfiles.map((followedUser) => (
                <Link href={`/dashboard/profile/${followedUser.id}`} key={followedUser.id}>
                    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <Avatar>
                        {followedUser.emojiAvatar ? (
                            <span className="flex h-full w-full items-center justify-center text-2xl">{followedUser.emojiAvatar}</span>
                        ) : (
                            <AvatarFallback>{followedUser.name?.charAt(0)}</AvatarFallback>
                        )}
                    </Avatar>
                    <p className="font-medium">{followedUser.name}</p>
                    </div>
                </Link>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Not following anyone yet.</p>
                )}
            </div>
            </CardContent>
        </Card>
    )
}


export default function UserProfilePage() {
  const { user: currentUser, loading: authLoading } = useUser();
  const params = useParams();
  const userId = params.id as string;
  
  const userRef = userId ? doc(firestore, 'users', userId) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<AppUser>(userRef);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
      return (
        <>
          <Header title="User Profile" />
          <div className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-48 w-full max-w-lg" />
              <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-64 w-full" />
                  </div>
              </div>
          </div>
        </>
      )
  }

  if (!userProfile) {
    notFound();
  }

  const isCurrentUserProfile = userProfile.id === currentUser?.uid;

  return (
    <>
      <Header title="User Profile" />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeaderCard profile={userProfile as EnrichedUser} isCurrentUserProfile={isCurrentUserProfile} />
            <OwnedBadges userId={userProfile.id} />
          </div>
          <div className="lg:col-span-1 space-y-6">
             <FollowingList user={userProfile as EnrichedUser} />
          </div>
        </div>
      </div>
    </>
  );
}
