import { atom } from 'jotai';

// This file is now deprecated for data storage but the types are still used.
// The data is now fetched from Firebase.

export type User = { 
    id: string; 
    name: string; 
    email: string; 
    emojiAvatar?: string; 
    following: string[]; 
};

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
}

export type BadgeFollower = {
    userId: string;
    badgeId: string;
    followedAt: number;
}

export type ShareLink = { 
    linkId: string; 
    badgeId: string; 
    ownerId: string; 
    used: boolean; 
    claimedBy: string | null;
    createdAt: number;
};

export type Notification = { 
    id: string; 
    type: 'BADGE_REQUEST' | 'BADGE_RECEIVED' | 'OWNERSHIP_TRANSFER';
    userId: string;
    fromUserId: string; 
    badgeId: string; 
    createdAt: number; 
    read: boolean; 
    shareLinkId?: string;
};

// This atom represents the currently logged-in Firebase user's UID.
export const currentUserIdAtom = atom<string | null>(null);
