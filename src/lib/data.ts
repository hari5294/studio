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

export const getBadgeById = (id: string) => badges.find((b) => b.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getBadgesByOwner = (ownerId: string) => badges.filter((b) => b.owners.includes(ownerId));
