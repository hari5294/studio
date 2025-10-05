
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// TYPES
export type User = { id: string; name: string; email: string; emojiAvatar?: string; following: string[]; };
export type Badge = { id: string; name: string; emojis: string; tokens: number; creatorId: string; createdAt: number; owners: string[]; followers: string[]; };
export type ShareLink = { id: string; badgeId: string; ownerId: string; used: boolean; claimedBy: string | null; };
export type Notification = { id: string; type: 'BADGE_REQUEST' | 'BADGE_RECEIVED' | 'OWNERSHIP_TRANSFER'; userId: string; fromUserId: string; badgeId: string; createdAt: number; read: boolean; shareLinkId?: string; };

// NEW MOCK DATA
const initialUsers: User[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', emojiAvatar: '👩‍💻', following: ['u2'] },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', emojiAvatar: '👨‍🎨', following: ['u1', 'u3'] },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', emojiAvatar: '👨‍🚀', following: ['u2'] },
    { id: 'u4', name: 'Diana', email: 'diana@example.com', emojiAvatar: '🦸‍♀️', following: [] },
];

const initialBadges: Badge[] = [
    { id: 'b1', name: 'Galactic Pioneer', emojis: '🌌🚀✨', tokens: 50, creatorId: 'u3', createdAt: Date.now() - 2 * 86400000, owners: ['u3', 'u2'], followers: ['u3', 'u2', 'u1'] },
    { id: 'b2', name: 'Pixel Perfect', emojis: '🎨🖼️🖌️', tokens: 250, creatorId: 'u2', createdAt: Date.now() - 5 * 86400000, owners: ['u2'], followers: ['u2', 'u1'] },
    { id: 'b3', name: 'Code Ninja', emojis: '💻🥋🥷', tokens: 1000, creatorId: 'u1', createdAt: Date.now() - 1 * 86400000, owners: ['u1'], followers: ['u1', 'u2'] },
    { id: 'b4', name: 'Super Squad', emojis: '🦸‍♀️🦸‍♂️💥', tokens: 100, creatorId: 'u4', createdAt: Date.now(), owners: ['u4'], followers: ['u4'] },
];

const initialShareLinks: ShareLink[] = [
    { id: 'sl1', badgeId: 'b1', ownerId: 'u3', used: false, claimedBy: null },
    { id: 'sl2', badgeId: 'b2', ownerId: 'u2', used: true, claimedBy: 'u1' },
    { id: 'sl3', badgeId: 'b3', ownerId: 'u1', used: false, claimedBy: null },
];

const initialNotifications: Notification[] = [
    { id: 'n1', type: 'BADGE_REQUEST', userId: 'u2', fromUserId: 'u1', badgeId: 'b2', createdAt: Date.now() - 1 * 3600000, read: false },
    { id: 'n2', type: 'BADGE_RECEIVED', userId: 'u1', fromUserId: 'u2', badgeId: 'b2', createdAt: Date.now() - 2 * 3600000, read: true, shareLinkId: 'sl2' },
    { id: 'n3', type: 'OWNERSHIP_TRANSFER', userId: 'u2', fromUserId: 'u3', badgeId: 'b1', createdAt: Date.now() - 4 * 3600000, read: true },
];

// CONTEXT & PROVIDER
interface MockDataContextType {
    users: User[];
    badges: Badge[];
    shareLinks: ShareLink[];
    notifications: Notification[];
    loading: boolean;
    updateUser: (userId: string, updates: Partial<User>) => void;
    followUser: (currentUserId: string, targetUserId: string) => void;
    unfollowUser: (currentUserId: string, targetUserId: string) => void;
    createBadge: (badgeData: Omit<Badge, 'id' | 'createdAt' | 'owners' | 'followers'>) => Badge;
    transferBadgeOwnership: (badgeId: string, newCreatorId: string) => void;
    followBadge: (badgeId: string, userId: string) => void;
    unfollowBadge: (badgeId: string, userId: string) => void;
    createShareLink: (linkData: { badgeId: string, ownerId: string }) => ShareLink;
    redeemShareLink: (linkId: string, redeemingUserId: string) => { badge: Badge, link: ShareLink };
    addNotification: (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [badges, setBadges] = useState<Badge[]>(initialBadges);
    const [shareLinks, setShareLinks] = useState<ShareLink[]>(initialShareLinks);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    
    // Simulate initial data load
    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    const updateUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    }

    const followUser = (currentUserId: string, targetUserId: string) => {
        setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, following: [...u.following, targetUserId] } : u));
    }

    const unfollowUser = (currentUserId: string, targetUserId: string) => {
        setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, following: u.following.filter(id => id !== targetUserId) } : u));
    }
    
    const createBadge = (badgeData: Omit<Badge, 'id' | 'createdAt' | 'owners' | 'followers'>) => {
        const newBadge: Badge = {
            ...badgeData,
            id: String(Date.now()),
            createdAt: Date.now(),
            owners: [badgeData.creatorId],
            followers: [badgeData.creatorId],
        };
        setBadges(prev => [newBadge, ...prev]);

        // Create initial share links for the creator
        for (let i = 0; i < 3; i++) {
            createShareLink({ badgeId: newBadge.id, ownerId: newBadge.creatorId });
        }
        
        return newBadge;
    }

    const transferBadgeOwnership = (badgeId: string, newCreatorId: string) => {
        setBadges(prev => prev.map(b => {
            if (b.id === badgeId) {
                // Add notification for the new owner
                addNotification({
                    userId: newCreatorId,
                    fromUserId: b.creatorId,
                    badgeId: b.id,
                    type: 'OWNERSHIP_TRANSFER'
                });
                return { ...b, creatorId: newCreatorId };
            }
            return b;
        }));
    }

    const followBadge = (badgeId: string, userId: string) => {
        setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, followers: [...new Set([...b.followers, userId])] } : b));
    }

    const unfollowBadge = (badgeId: string, userId: string) => {
        setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, followers: b.followers.filter(id => id !== userId) } : b));
    }

    const createShareLink = (linkData: { badgeId: string, ownerId: string }) => {
        const newLink: ShareLink = {
            id: `link-${Date.now()}-${Math.random()}`,
            ...linkData,
            used: false,
            claimedBy: null,
        };
        setShareLinks(prev => [...prev, newLink]);
        return newLink;
    }

    const redeemShareLink = (linkId: string, redeemingUserId: string) => {
        const linkIndex = shareLinks.findIndex(l => l.id === linkId);
        if (linkIndex === -1 || shareLinks[linkIndex].used) {
            throw new Error("This code is invalid or has already been used.");
        }

        const link = shareLinks[linkIndex];
        const badgeIndex = badges.findIndex(b => b.id === link.badgeId);
        if (badgeIndex === -1) {
            throw new Error("Badge not found.");
        }
        
        const badge = badges[badgeIndex];
        if (badge.owners.includes(redeemingUserId)) {
            throw new Error(`You already own the "${badge.name}" badge.`);
        }
        if (badge.owners.length >= badge.tokens) {
            throw new Error(`No more "${badge.name}" badges are available.`);
        }
        
        // Update link
        const updatedLink = { ...link, used: true, claimedBy: redeemingUserId };
        setShareLinks(prev => prev.map(l => l.id === linkId ? updatedLink : l));

        // Update badge owners and followers
        const updatedBadge = { ...badge, owners: [...badge.owners, redeemingUserId], followers: [...new Set([...badge.followers, redeemingUserId])] };
        setBadges(prev => prev.map(b => b.id === badge.id ? updatedBadge : b));
        
        return { badge: updatedBadge, link: updatedLink };
    }
    
    const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}`,
            createdAt: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }
    
    const markNotificationAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }
    
    const value = {
        users,
        badges,
        shareLinks,
        notifications,
        loading,
        updateUser,
        followUser,
        unfollowUser,
        createBadge,
        transferBadgeOwnership,
        followBadge,
        unfollowBadge,
        createShareLink,
        redeemShareLink,
        addNotification,
        markNotificationAsRead
    };

    return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (context === undefined) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
