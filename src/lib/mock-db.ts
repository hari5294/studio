

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
};

export type ShareLink = {
    linkId: string; // This is the unique secret code
    badgeId: string;
    ownerId: string; // The user who generated this link
    used: boolean;
    claimedBy: string | null; // which user used this link
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
  },
  {
    id: 'badge-2',
    name: 'Ocean Guardians',
    emojis: '🌊🐢🐠',
    tokens: 500,
    ownerId: 'user-2',
    owners: ['user-2', 'user-4', 'user-5'],
    followers: ['user-1'],
  },
  {
    id: 'badge-3',
    name: 'Pixel Pioneers',
    emojis: '👾🎮🕹️',
    tokens: 750,
    ownerId: 'user-1',
    owners: ['user-1'],
    followers: ['user-5'],
  },
  {
    id: 'badge-4',
    name: 'Forest Friends',
    emojis: '🌲🦊🦉',
    tokens: 1200,
    ownerId: 'user-4',
    owners: ['user-4', 'user-1', 'user-3'],
    followers: ['user-2', 'user-5'],
  },
  {
    id: 'badge-5',
    name: 'Culinary Creators',
    emojis: '👨‍🍳🥐🍰',
    tokens: 800,
    ownerId: 'user-3',
    owners: ['user-3'],
    followers: [],
  },
   {
    id: 'badge-6',
    name: 'Music Makers',
    emojis: '🎸🎹🎤',
    tokens: 2500,
    ownerId: 'user-5',
    owners: ['user-5'],
    followers: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
];

let shareLinks: ShareLink[] = [];


// --- Data Access Functions ---

export const getBadgeById = (id: string) => badges.find((b) => b.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getBadgesByOwner = (ownerId: string) => badges.filter((b) => b.owners.includes(ownerId));
export const getAllBadges = () => badges;
export const getAllUsers = () => users;
export const searchBadges = (query: string) => badges.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
export const searchUsers = (query: string) => users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));


// --- Data Mutation Functions ---

export const createBadge = (data: Omit<Badge, 'id' | 'ownerId' | 'owners' | 'followers'>, creatorId: string): {newBadge: Badge, initialLinks: ShareLink[]} => {
  const newId = `badge-${badges.length + 1}`;
  const newBadge: Badge = {
    ...data,
    id: newId,
    ownerId: creatorId,
    owners: [creatorId],
    followers: [],
  };
  badges.unshift(newBadge);
  const initialLinks = createShareLinks(newBadge.id, creatorId, 3);
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

    // Claim the badge
    badge.owners.push(userId);
    // Mark the link as used
    useShareLink(linkId, userId);

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

        const newLink: ShareLink = {
            linkId: Math.random().toString(36).substring(2, 10),
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
