
'use client';

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import type { User } from '@/hooks/use-auth';

// DATA TYPES
export type Badge = {
  id: string;
  name: string;
  emojis: string;
  tokens: number;
  creatorId: string;
  createdAt: number;
};

export type BadgeOwner = {
  userId: string;
  badgeId: string;
  claimedAt: number;
};

export type BadgeFollower = {
    userId: string;
    badgeId: string;
    followedAt: number;
}

export type ShareLink = {
  id: string;
  badgeId: string;
  ownerId: string;
  used: boolean;
  claimedBy: string | null;
  createdAt: number;
};

export type Notification = {
  id: string;
  type: 'BADGE_REQUEST' | 'BADGE_RECEIVED' | 'OWNERSHIP_TRANSFER';
  fromUserId: string;
  toUserId: string;
  badgeId: string;
  createdAt: number;
  read: boolean;
  shareLinkId?: string;
};


// INITIAL MOCK DATA
const initialUsers: User[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', emojiAvatar: '👩‍💻', following: ['u2', 'u3'] },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', emojiAvatar: '👨‍🎨', following: ['u1'] },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', emojiAvatar: '👨‍🚀', following: ['u1', 'u2'] },
    { id: 'u4', name: 'Diana', email: 'diana@example.com', emojiAvatar: '🦸‍♀️', following: [] },
];

const initialBadges: Badge[] = [
    { id: 'b1', name: 'Galactic Pioneer', emojis: '🌌🚀✨', tokens: 50, creatorId: 'u3', createdAt: Date.now() - 100000 },
    { id: 'b2', name: 'Pixel Perfect', emojis: '🎨🖼️🖌️', tokens: 250, creatorId: 'u2', createdAt: Date.now() - 200000 },
    { id: 'b3', name: 'Code Ninja', emojis: '💻🥋🥷', tokens: 1000, creatorId: 'u1', createdAt: Date.now() - 300000 },
];

const initialBadgeOwners: BadgeOwner[] = [
    { userId: 'u1', badgeId: 'b3', claimedAt: Date.now() - 300000 },
    { userId: 'u2', badgeId: 'b2', claimedAt: Date.now() - 200000 },
    { userId: 'u3', badgeId: 'b1', claimedAt: Date.now() - 100000 },
    { userId: 'u2', badgeId: 'b1', claimedAt: Date.now() - 50000 },
];

const initialBadgeFollowers: BadgeFollower[] = [
    { userId: 'u1', badgeId: 'b1', followedAt: Date.now() },
    { userId: 'u1', badgeId: 'b2', followedAt: Date.now() },
    { userId: 'u2', badgeId: 'b3', followedAt: Date.now() },
];


const initialShareLinks: ShareLink[] = [
    { id: 'sl1', badgeId: 'b1', ownerId: 'u3', used: false, claimedBy: null, createdAt: Date.now() },
    { id: 'sl2', badgeId: 'b1', ownerId: 'u3', used: false, claimedBy: null, createdAt: Date.now() },
    { id: 'sl3', badgeId: 'b2', ownerId: 'u2', used: true, claimedBy: 'u1', createdAt: Date.now() - 500000 },
];

const initialNotifications: Notification[] = [
    { id: 'n1', type: 'BADGE_REQUEST', fromUserId: 'u2', toUserId: 'u1', badgeId: 'b3', createdAt: Date.now() - 1 * 3600000, read: false },
    { id: 'n2', type: 'BADGE_RECEIVED', fromUserId: 'u3', toUserId: 'u1', badgeId: 'b1', createdAt: Date.now() - 2 * 3600000, read: true, shareLinkId: 'some-used-link-1' },
    { id: 'n3', type: 'OWNERSHIP_TRANSFER', fromUserId: 'u2', toUserId: 'u1', badgeId: 'b2', createdAt: Date.now() - 4 * 3600000, read: true },
    { id: 'n4', type: 'BADGE_RECEIVED', fromUserId: 'u1', toUserId: 'u2', badgeId: 'b3', createdAt: Date.now() - 5 * 3600000, read: false, shareLinkId: 'sl4' },
];

// CONTEXT DEFINITION
type MockDataContextType = {
  users: User[];
  badges: Badge[];
  badgeOwners: BadgeOwner[];
  badgeFollowers: BadgeFollower[];
  shareLinks: ShareLink[];
  notifications: Notification[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  createBadge: (badgeData: Omit<Badge, 'id' | 'createdAt'>) => Badge;
  createShareLinks: (badgeId: string, ownerId: string, count: number) => ShareLink[];
  redeemShareLink: (linkId: string, claimingUserId: string) => { badge: Badge, link: ShareLink };
  getBadgeWithDetails: (badgeId: string) => any;
  getUserWithDetails: (userId: string) => any;
  getNotificationsForUser: (userId: string) => any[];
  toggleFollowUser: (currentUserId: string, targetUserId: string) => void;
  toggleFollowBadge: (userId: string, badgeId: string) => void;
  requestBadge: (requesterId: string, badgeId: string) => void;
  sendBadge: (fromUserId: string, toUserId: string, badgeId: string) => void;
  transferBadgeOwnership: (badgeId: string, newCreatorId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
};

export const MockDataContext = createContext<MockDataContextType | undefined>(undefined);


// PROVIDER COMPONENT
export const MockDataProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState(initialUsers);
    const [badges, setBadges] = useState(initialBadges);
    const [badgeOwners, setBadgeOwners] = useState(initialBadgeOwners);
    const [badgeFollowers, setBadgeFollowers] = useState(initialBadgeFollowers);
    const [shareLinks, setShareLinks] = useState(initialShareLinks);
    const [notifications, setNotifications] = useState(initialNotifications);

    const updateUser = useCallback((userId: string, updates: Partial<User>) => {
        setUsers(currentUsers =>
            currentUsers.map(u => (u.id === userId ? { ...u, ...updates } : u))
        );
    }, []);
    
    const createShareLinks = useCallback((badgeId: string, ownerId: string, count: number): ShareLink[] => {
        const newLinks: ShareLink[] = [];
        for (let i = 0; i < count; i++) {
            newLinks.push({
                id: `sl-${badgeId}-${Date.now()}-${i}`,
                badgeId,
                ownerId,
                used: false,
                claimedBy: null,
                createdAt: Date.now(),
            });
        }
        setShareLinks(prev => [...prev, ...newLinks]);
        return newLinks;
    }, []);

    const createBadge = useCallback((badgeData: Omit<Badge, 'id' | 'createdAt'>): Badge => {
        const newBadge: Badge = {
            ...badgeData,
            id: `b${Date.now()}`,
            createdAt: Date.now(),
        };
        setBadges(prev => [...prev, newBadge]);
        setBadgeOwners(prev => [...prev, { userId: newBadge.creatorId, badgeId: newBadge.id, claimedAt: newBadge.createdAt }]);
        setBadgeFollowers(prev => [...prev, { userId: newBadge.creatorId, badgeId: newBadge.id, followedAt: newBadge.createdAt }]);
        createShareLinks(newBadge.id, newBadge.creatorId, 5); // Automatically create 5 share links
        return newBadge;
    }, [createShareLinks]);

    const redeemShareLink = useCallback((linkId: string, claimingUserId: string): { badge: Badge, link: ShareLink } => {
        const link = shareLinks.find(l => l.id === linkId);
        if (!link || link.used) {
            throw new Error("This invitation code is invalid or has already been used.");
        }
        const badge = badges.find(b => b.id === link.badgeId);
        if (!badge) {
            throw new Error("The badge associated with this code could not be found.");
        }
        if (badgeOwners.some(bo => bo.badgeId === badge.id && bo.userId === claimingUserId)) {
             throw new Error(`You already own the "${badge.name}" badge.`);
        }
        
        setShareLinks(prev => prev.map(l => l.id === linkId ? { ...l, used: true, claimedBy: claimingUserId } : l));
        setBadgeOwners(prev => [...prev, { userId: claimingUserId, badgeId: badge.id, claimedAt: Date.now() }]);
        
        // Also follow the badge when claimed
        if (!badgeFollowers.some(f => f.userId === claimingUserId && f.badgeId === badge.id)) {
            setBadgeFollowers(prev => [...prev, { userId: claimingUserId, badgeId: badge.id, followedAt: Date.now() }]);
        }

        const updatedLink = { ...link, used: true, claimedBy: claimingUserId };
        return { badge, link: updatedLink };

    }, [shareLinks, badges, badgeOwners, badgeFollowers]);
    
    const getBadgeWithDetails = useCallback((badgeId: string) => {
        const badge = badges.find(b => b.id === badgeId);
        if (!badge) return null;

        const owners = badgeOwners.filter(bo => bo.badgeId === badgeId).map(bo => users.find(u => u.id === bo.userId)).filter(Boolean);
        const followers = badgeFollowers.filter(bf => bf.badgeId === badgeId).map(bf => users.find(u => u.id === bf.userId)).filter(Boolean);
        const creator = users.find(u => u.id === badge.creatorId);

        return { ...badge, owners, followers, creator };
    }, [badges, badgeOwners, badgeFollowers, users]);

    const getUserWithDetails = useCallback((userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return null;

        const ownedBadges = badgeOwners.filter(bo => bo.userId === userId).map(bo => getBadgeWithDetails(bo.badgeId)).filter(Boolean);
        const followingUsers = user.following.map(uid => users.find(u => u.id === uid)).filter(Boolean);
        const createdBadges = badges.filter(b => b.creatorId === userId).map(b => getBadgeWithDetails(b.id)).filter(Boolean);

        return { ...user, ownedBadges, followingUsers, createdBadges };
    }, [users, badgeOwners, badges, getBadgeWithDetails]);

    const getNotificationsForUser = useCallback((userId: string) => {
        return notifications
            .filter(n => n.toUserId === userId)
            .map(n => {
                const fromUser = users.find(u => u.id === n.fromUserId);
                const badge = badges.find(b => b.id === n.badgeId);
                return { ...n, fromUser, badge };
            })
            .filter(n => n.fromUser && n.badge)
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [notifications, users, badges]);
    
    const toggleFollowUser = useCallback((currentUserId: string, targetUserId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === currentUserId) {
                const isFollowing = u.following.includes(targetUserId);
                const newFollowing = isFollowing
                    ? u.following.filter(id => id !== targetUserId)
                    : [...u.following, targetUserId];
                return { ...u, following: newFollowing };
            }
            return u;
        }));
    }, []);

    const toggleFollowBadge = useCallback((userId: string, badgeId: string) => {
        const isFollowing = badgeFollowers.some(f => f.userId === userId && f.badgeId === badgeId);
        if (isFollowing) {
            setBadgeFollowers(prev => prev.filter(f => !(f.userId === userId && f.badgeId === badgeId)));
        } else {
            setBadgeFollowers(prev => [...prev, { userId, badgeId, followedAt: Date.now() }]);
        }
    }, [badgeFollowers]);
    
    const requestBadge = useCallback((requesterId: string, badgeId: string) => {
        const badge = badges.find(b => b.id === badgeId);
        if (!badge) return;
        const newNotification: Notification = {
            id: `n-${Date.now()}`,
            type: 'BADGE_REQUEST',
            fromUserId: requesterId,
            toUserId: badge.creatorId,
            badgeId,
            createdAt: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, [badges]);
    
    const sendBadge = useCallback((fromUserId: string, toUserId: string, badgeId: string) => {
        const [shareLink] = createShareLinks(badgeId, fromUserId, 1);
        const newNotification: Notification = {
            id: `n-${Date.now()}`,
            type: 'BADGE_RECEIVED',
            fromUserId,
            toUserId,
            badgeId,
            createdAt: Date.now(),
            read: false,
            shareLinkId: shareLink.id
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Also remove the corresponding request notification
        setNotifications(prev => prev.filter(n => 
            !(n.type === 'BADGE_REQUEST' && n.fromUserId === toUserId && n.toUserId === fromUserId && n.badgeId === badgeId)
        ));

    }, [createShareLinks]);

    const transferBadgeOwnership = useCallback((badgeId: string, newCreatorId: string) => {
        const badge = badges.find(b => b.id === badgeId);
        if (!badge) return;

        setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, creatorId: newCreatorId } : b));
        
        const newNotification: Notification = {
            id: `n-${Date.now()}`,
            type: 'OWNERSHIP_TRANSFER',
            fromUserId: badge.creatorId, // old creator
            toUserId: newCreatorId,
            badgeId,
            createdAt: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, [badges]);

    const markNotificationAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }, []);

    const value = {
        users,
        badges,
        badgeOwners,
        badgeFollowers,
        shareLinks,
        notifications,
        updateUser,
        createBadge,
        createShareLinks,
        redeemShareLink,
        getBadgeWithDetails,
        getUserWithDetails,
        getNotificationsForUser,
        toggleFollowUser,
        toggleFollowBadge,
        requestBadge,
        sendBadge,
        transferBadgeOwnership,
        markNotificationAsRead
    };

    return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};

    