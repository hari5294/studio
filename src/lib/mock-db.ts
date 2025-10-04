
export type User = {
  id: string;
  name: string;
  avatarUrl: string;
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

export const users: User[] = [
  { id: 'user-1', name: 'Alex', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100' },
  { id: 'user-2', name: 'Maria', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100' },
  { id: 'user-3', name: 'David', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100' },
  { id: 'user-4', name: 'Sarah', avatarUrl: 'https://picsum.photos/seed/avatar4/100/100' },
  { id: 'user-5', name: 'Ken', avatarUrl: 'https://picsum.photos/seed/avatar5/100/100' },
];

export const badges: Badge[] = [
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
