
'use client';

import { users as initialUsers, badges as initialBadges, type User, type Badge } from './mock-db';

// In-memory store
let users: User[] = [...initialUsers];
let badges: Badge[] = [...initialBadges.map(b => ({...b, owners: [...b.owners], followers: [...b.followers]}))];

// --- Data Access Functions ---

export const getBadgeById = (id: string) => badges.find((b) => b.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getBadgesByOwner = (ownerId: string) => badges.filter((b) => b.owners.includes(ownerId));
export const getAllBadges = () => badges;
export const getAllUsers = () => users;


// --- Data Mutation Functions ---

export const createBadge = (data: Omit<Badge, 'id' | 'ownerId' | 'owners' | 'followers'>, creatorId: string): Badge => {
  const newId = `badge-${badges.length + 1}`;
  const newBadge: Badge = {
    ...data,
    id: newId,
    ownerId: creatorId,
    owners: [creatorId],
    followers: [],
  };
  badges.unshift(newBadge);
  return newBadge;
};

export const followBadge = (badgeId: string, userId: string) => {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new Error('Badge not found');
    
    if (badge.followers.includes(userId)) {
        // Unfollow
        badge.followers = badge.followers.filter(id => id !== userId);
    } else {
        // Follow
        badge.followers.push(userId);
    }
    return badge;
}

export const claimBadge = (badgeId: string, userId: string) => {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new Error('Badge not found');
    if (badge.owners.length >= badge.tokens) throw new Error('No badges left to claim');
    if (badge.owners.includes(userId)) throw new Error('User already owns this badge');

    badge.owners.push(userId);
    return badge;
}

export const transferBadgeOwnership = (badgeId: string, newOwnerId: string) => {
    const badge = getBadgeById(badgeId);
    const user = getUserById(newOwnerId);

    if (!badge) throw new Error('Badge not found');
    if (!user) throw new Error('Recipient user not found');

    badge.ownerId = newOwnerId;
    if (!badge.owners.includes(newOwnerId)) {
        badge.owners.push(newOwnerId);
    }
    return badge;
}

// --- Share Link Simulation ---
type ShareLink = {
    linkId: string;
    badgeId: string;
    expires: number;
    used: boolean;
};

let shareLinks: ShareLink[] = [];

export const createShareLinks = (badgeId: string, count: number): ShareLink[] => {
    const newLinks: ShareLink[] = [];
    for (let i = 0; i < count; i++) {
        const newLink: ShareLink = {
            linkId: Math.random().toString(36).substring(2, 10),
            badgeId: badgeId,
            expires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
            used: false,
        };
        newLinks.push(newLink);
    }
    shareLinks.push(...newLinks);
    return newLinks;
}

export const getShareLink = (linkId: string): ShareLink | undefined => {
    return shareLinks.find(l => l.linkId === linkId);
}

export const useShareLink = (linkId: string): ShareLink | undefined => {
    const link = getShareLink(linkId);
    if (link) {
        link.used = true;
    }
    return link;
}
