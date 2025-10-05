

// Data is now fetched from Firebase. The types are still used across the app.

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
