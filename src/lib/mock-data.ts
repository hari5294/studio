import { atom, useAtom } from 'jotai';

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
    owners: string[]; 
    followers: string[]; 
    createdAt: number; 
};

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

// Initial Data
const initialUsers: Record<string, User> = {
  'user1': { id: 'user1', name: 'John Doe', email: 'john@example.com', emojiAvatar: '🧑‍🚀', following: ['user2'] },
  'user2': { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', emojiAvatar: '👩‍🔬', following: [] },
  'user3': { id: 'user3', name: 'Alex Ray', email: 'alex@example.com', emojiAvatar: '🧑‍🎤', following: ['user1'] },
};

const initialBadges: Record<string, Badge> = {
  'badge1': { id: 'badge1', name: 'Cosmic Explorer', emojis: '🚀✨🪐', tokens: 1000, creatorId: 'user1', owners: ['user1', 'user2'], followers: ['user1', 'user2'], createdAt: Date.now() - 86400000 * 2 },
  'badge2': { id: 'badge2', name: 'Ocean Diver', emojis: '🌊🐠🐙', tokens: 500, creatorId: 'user2', owners: ['user2'], followers: ['user1'], createdAt: Date.now() - 86400000 * 5 },
  'badge3': { id: 'badge3', name: 'Pixel Artist', emojis: '🎨👾🕹️', tokens: 100, creatorId: 'user3', owners: [], followers: [], createdAt: Date.now() - 86400000 * 1 },
  'badge4': { id: 'badge4', name: 'Synthwave Rider', emojis: '🌆🎶📼', tokens: 1984, creatorId: 'user3', owners: ['user3'], followers: ['user1', 'user3'], createdAt: Date.now() - 86400000 * 10 },
  'badge5': { id: 'badge5', name: 'Eco Warrior', emojis: '🌳♻️🌍', tokens: 2050, creatorId: 'user1', owners: ['user1', 'user2'], followers: ['user2'], createdAt: Date.now() - 86400000 * 3 },
};

const initialShareLinks: Record<string, ShareLink> = {
    'link1': { linkId: 'link1', badgeId: 'badge1', ownerId: 'user1', used: false, claimedBy: null, createdAt: Date.now() },
    'link2': { linkId: 'link2', badgeId: 'badge2', ownerId: 'user2', used: false, claimedBy: null, createdAt: Date.now() - 86400000 * 2 }, // Expired
    'usedlink': { linkId: 'usedlink', badgeId: 'badge1', ownerId: 'user1', used: true, claimedBy: 'user2', createdAt: Date.now() },
};

const initialNotifications: Record<string, Notification> = {
    'n1': { id: 'n1', type: 'BADGE_REQUEST', userId: 'user1', fromUserId: 'user2', badgeId: 'badge1', createdAt: new Date(Date.now() - 1000 * 60 * 5).getTime(), read: true },
    'n2': { id: 'n2', type: 'BADGE_RECEIVED', userId: 'user1', fromUserId: 'user2', badgeId: 'badge2', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).getTime(), read: true, shareLinkId: 'link1' },
    'n3': { id: 'n3', type: 'BADGE_REQUEST', userId: 'user1', fromUserId: 'user3', badgeId: 'badge1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).getTime(), read: true },
};

// Jotai Atoms
export const usersAtom = atom<Record<string, User>>(initialUsers);
export const badgesAtom = atom<Record<string, Badge>>(initialBadges);
export const shareLinksAtom = atom<Record<string, ShareLink>>(initialShareLinks);
export const notificationsAtom = atom<Record<string, Notification>>(initialNotifications);

// This will represent the currently "logged in" user.
export const currentUserIdAtom = atom<string | null>(null);

// Functions to interact with atoms - these functions will be called from components
// This allows us to potentially swap out the data source later (e.g., to Firebase)
// without changing the component code significantly.

// This is a "setter" function for the currentUserIdAtom.
// We are not exporting the atom directly to components to better encapsulate state logic.
export const login = (userId: string) => {
    const [, setCurrentUser] = useAtom(currentUserIdAtom);
    setCurrentUser(userId);
};

export const logout = () => {
    // This is a placeholder. In a real app, you'd call this from a component
    // context where you can use the useAtom hook.
    // For now, we have to create a custom hook or component to handle this.
};
