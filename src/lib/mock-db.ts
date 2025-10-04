

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  following: string[]; // array of user ids
};

export type Badge = {
  id: string;
  name: string;
  emojis: string;
  tokens: number;
  ownerId: string; // The original creator
  owners: string[]; // Array of user ids who own a copy
  followers: string[]; // array of user ids
  createdAt: number; // Unix timestamp
};

export type ShareLink = {
    linkId: string; // This is the unique secret code
    badgeId: string;
    ownerId: string; // The user who generated this link
    used: boolean;
    claimedBy: string | null; // which user used this link
};

export type Notification = {
    id: string;
    userId: string; // User who this notification is for
    type: 'BADGE_REQUEST' | 'BADGE_RECEIVED';
    fromUserId: string; // User who triggered the notification
    badgeId: string;
    createdAt: number;
    read: boolean;
};


// --- IN-MEMORY DATABASE ---

let users: User[] = [
  { id: 'user-1', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100', following: ['user-2', 'user-4'] },
  { id: 'user-2', name: 'Maria', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100', following: ['user-1'] },
  { id: 'user-3', name: 'David', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100', following: ['user-1', 'user-5'] },
  { id: 'user-4', name: 'Sarah', avatarUrl: 'https://picsum.photos/seed/avatar4/100/100', following: [] },
  { id: 'user-5', name: 'Ken', avatarUrl: 'https://picsum.photos/seed/avatar5/100/100', following: ['user-3'] },
];

let badges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Cosmic Explorers',
    emojis: '🚀✨🪐',
    tokens: 1000,
    ownerId: 'user-1',
    owners: ['user-1', 'user-2'], // Alex and Maria own this
    followers: ['user-3'],
    createdAt: 1700000000000,
  },
  {
    id: 'badge-2',
    name: 'Ocean Guardians',
    emojis: '🌊🐢🐠',
    tokens: 500,
    ownerId: 'user-2',
    owners: ['user-2', 'user-4', 'user-5'],
    followers: ['user-1'],
    createdAt: 1700000100000,
  },
  {
    id: 'badge-3',
    name: 'Pixel Pioneers',
    emojis: '👾🎮🕹️',
    tokens: 750,
    ownerId: 'user-1',
    owners: ['user-1'],
    followers: ['user-5'],
    createdAt: 1700000200000,
  },
  {
    id: 'badge-4',
    name: 'Forest Friends',
    emojis: '🌲🦊🦉',
    tokens: 1200,
    ownerId: 'user-4',
    owners: ['user-4', 'user-1', 'user-3'],
    followers: ['user-2', 'user-5'],
    createdAt: 1700000300000,
  },
  {
    id: 'badge-5',
    name: 'Culinary Creators',
    emojis: '👨‍🍳🥐🍰',
    tokens: 800,
    ownerId: 'user-3',
    owners: ['user-3'],
    followers: [],
    createdAt: 1700000400000,
  },
   {
    id: 'badge-6',
    name: 'Music Makers',
    emojis: '🎸🎹🎤',
    tokens: 2500,
    ownerId: 'user-5',
    owners: ['user-5'],
    followers: ['user-1', 'user-2', 'user-3', 'user-4'],
    createdAt: 1700000500000,
  },
];

let shareLinks: ShareLink[] = [];

let notifications: Notification[] = [
    // Mock notification for initial state
    { id: 'notif-1', userId: 'user-1', type: 'BADGE_REQUEST', fromUserId: 'user-3', badgeId: 'badge-1', createdAt: Date.now() - 100000, read: false },
    { id: 'notif-2', userId: 'user-2', type: 'BADGE_REQUEST', fromUserId: 'user-3', badgeId: 'badge-1', createdAt: Date.now() - 100000, read: true },
    { id: 'notif-3', userId: 'user-4', type: 'BADGE_RECEIVED', fromUserId: 'user-2', badgeId: 'badge-2', createdAt: Date.now() - 200000, read: false },
];


// --- Data Access Functions ---

export const getBadgeById = (id: string) => badges.find((b) => b.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getBadgesByOwner = (ownerId: string) => badges.filter((b) => b.owners.includes(ownerId));
export const getAllBadges = () => badges;
export const getAllUsers = () => users;
export const searchBadges = (query: string) => badges.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
export const searchUsers = (query: string) => users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));


// --- Data Mutation Functions ---

export const createBadge = (data: Omit<Badge, 'id' | 'ownerId' | 'owners' | 'followers' | 'createdAt'>, creatorId: string): {newBadge: Badge, initialLinks: ShareLink[]} => {
  const existingBadge = badges.find(b => b.emojis === data.emojis);
  if (existingBadge) {
    throw new Error('A badge with these emojis already exists.');
  }
  
  const newId = `badge-${badges.length + 1}`;
  const newBadge: Badge = {
    ...data,
    id: newId,
    ownerId: creatorId,
    owners: [creatorId],
    followers: [],
    createdAt: Date.now(),
  };
  badges.unshift(newBadge);
  const initialLinks = createShareLinks(newBadge.id, creatorId, 5);
  return { newBadge, initialLinks };
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

export const toggleFollowUser = (currentUserId: string, targetUserId: string) => {
    const currentUser = getUserById(currentUserId);
    if (!currentUser) throw new Error('Current user not found');
    if (currentUserId === targetUserId) throw new Error("You cannot follow yourself.");

    if (currentUser.following.includes(targetUserId)) {
        // Unfollow
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    } else {
        // Follow
        currentUser.following.push(targetUserId);
    }
    return currentUser;
}

export const claimBadge = (badgeId: string, userId: string, linkId: string): { badge: Badge, newLinks: ShareLink[] } => {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new Error('Badge not found');
    if (badge.owners.length >= badge.tokens) throw new Error('No badges left to claim');
    if (badge.owners.includes(userId)) throw new Error('User already owns this badge');

    const link = getShareLink(linkId);
    if (!link || link.used) throw new Error('This invitation code is invalid or has already been used.');
    if (link.ownerId === userId) throw new Error("You cannot use a code you generated yourself.");

    // Claim the badge
    badge.owners.push(userId);
    // Mark the link as used
    useShareLink(linkId, userId);
    
    // Notify the user they received a badge
    createNotification({
        userId: userId,
        type: 'BADGE_RECEIVED',
        fromUserId: link.ownerId,
        badgeId: badgeId,
    });


    // Generate a new link for the new owner, if tokens are available
    const newLinks = createShareLinks(badgeId, userId, 3);
    
    return { badge, newLinks };
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

export const createShareLinks = (badgeId: string, ownerId: string, count: number): ShareLink[] => {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new Error("Badge not found");
    
    const newLinks: ShareLink[] = [];
    for (let i = 0; i < count; i++) {
        const existingLinksCount = shareLinks.filter(l => l.badgeId === badgeId && !l.used).length;
        const availableTokens = badge.tokens - badge.owners.length - existingLinksCount;
        if (availableTokens <= 0) break; // Stop if no tokens are left

        // Create a more meaningful secret code
        const badgeNamePart = badge.name.replace(/\s/g, '').substring(0, 5).toUpperCase();
        const timePart = badge.createdAt.toString().slice(-5);
        const randomPart = Math.random().toString(36).substring(2, 6);
        const secretCode = `${badgeNamePart}-${badge.id}-${timePart}-${randomPart}`;
        
        // Use btoa for simple base64 encoding on the client/server
        const encodedId = typeof window === 'undefined' ? Buffer.from(secretCode).toString('base64') : btoa(secretCode);

        const newLink: ShareLink = {
            linkId: encodedId,
            badgeId: badgeId,
            ownerId: ownerId,
            used: false,
            claimedBy: null,
        };
        shareLinks.push(newLink);
        newLinks.push(newLink);
    }
    
    return newLinks;
}

export const getShareLink = (linkId: string): ShareLink | undefined => {
    return shareLinks.find(l => l.linkId === linkId);
}

export const getShareLinksForUser = (badgeId: string, userId: string): ShareLink[] => {
    return shareLinks.filter(l => l.badgeId === badgeId && l.ownerId === userId && !l.used);
}


export const useShareLink = (linkId: string, userId: string): ShareLink | undefined => {
    const link = getShareLink(linkId);
    if (link) {
        if (link.used) throw new Error("Link has already been used.");
        link.used = true;
        link.claimedBy = userId;
    }
    return link;
}


// --- Notification System ---

export const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export const getUnreadNotificationCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
}

export const markNotificationAsRead = (notificationId: string, userId: string) => {
    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
        notification.read = true;
    }
    return notification;
}

export const createNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
        ...data,
        id: `notif-${notifications.length + 1}`,
        createdAt: Date.now(),
        read: false,
    };
    notifications.unshift(newNotif);
    return newNotif;
}

export const requestBadgeCode = (badgeId: string, fromUserId: string) => {
    const badge = getBadgeById(badgeId);
    if (!badge) throw new Error("Badge not found.");

    // Create a notification for each owner of the badge
    badge.owners.forEach(ownerId => {
        // Don't notify the person who made the request
        if (ownerId === fromUserId) return;

        createNotification({
            userId: ownerId,
            type: 'BADGE_REQUEST',
            fromUserId: fromUserId,
            badgeId: badgeId,
        });
    });

    return { success: true };
}
