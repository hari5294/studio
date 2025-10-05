
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// TYPES
export type User = { id: string; name: string; email: string; emojiAvatar?: string; following: string[]; };
export type Badge = { id: string; name: string; emojis: string; tokens: number; creatorId: string; createdAt: number; owners: string[]; followers: string[]; };
export type ShareLink = { id: string; badgeId: string; ownerId: string; used: boolean; claimedBy: string | null; };
export type Notification = { id: string; type: 'BADGE_REQUEST' | 'BADGE_RECEIVED' | 'OWNERSHIP_TRANSFER'; userId: string; fromUserId: string; badgeId: string; createdAt: number; read: boolean; shareLinkId?: string; };

// MOCK DATA
const initialUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'johndoe@example.com', emojiAvatar: '👨‍🚀', following: ['2', '3'] },
    { id: '2', name: 'Jane Smith', email: 'janesmith@example.com', emojiAvatar: '🎨', following: ['1'] },
    { id: '3', name: 'Cosmo Kramer', email: 'cosmo@example.com', emojiAvatar: '🤪', following: [] },
];

const initialBadges: Badge[] = [
    { id: '101', name: 'Early Adopter', emojis: '🥇🚀🌟', tokens: 100, creatorId: '1', createdAt: Date.now() - 86400000, owners: ['1', '2'], followers: ['1', '2', '3'] },
    { id: '102', name: 'Bug Squasher', emojis: '🐞💥🔨', tokens: 500, creatorId: '2', createdAt: Date.now() - 172800000, owners: ['2'], followers: ['1', '2'] },
    { id: '103', name: 'Community Helper', emojis: '🤝❤️😊', tokens: 1000, creatorId: '1', createdAt: Date.now(), owners: ['1'], followers: ['1', '3'] },
];

const initialShareLinks: ShareLink[] = [
    { id: 'xyz789', badgeId: '101', ownerId: '1', used: false, claimedBy: null },
    { id: 'abc123', badgeId: '102', ownerId: '2', used: true, claimedBy: '1' },
];

const initialNotifications: Notification[] = [
    { id: '201', type: 'BADGE_REQUEST', userId: '1', fromUserId: '3', badgeId: '101', createdAt: Date.now() - 3600000, read: false },
    { id: '202', type: 'BADGE_RECEIVED', userId: '3', fromUserId: '1', badgeId: '103', createdAt: Date.now() - 7200000, read: true, shareLinkId: 'def456' },
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
        markNotificationAsRead,
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
