
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// TEMPORARY MOCK USER DATA - to be replaced by Firebase Auth
export type User = { id: string; name: string; email: string; emojiAvatar?: string; following: string[]; };

const mockUsers: User[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', emojiAvatar: '👩‍💻', following: ['u2'] },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', emojiAvatar: '👨‍🎨', following: ['u1', 'u3'] },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', emojiAvatar: '👨‍🚀', following: ['u2'] },
    { id: 'u4', name: 'Diana', email: 'diana@example.com', emojiAvatar: '🦸‍♀️', following: [] },
];
// END TEMPORARY MOCK

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
};

export function useAuth(options: { required?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loggedInUserEmail = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
    
    if (loggedInUserEmail) {
      const foundUser = mockUsers.find(u => u.email === loggedInUserEmail);
      setUser(foundUser || null);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = ['/login', '/signup'].includes(pathname);

    if (options.required && !user && !isAuthPage) {
      router.push('/login');
    }

    if (user && (isAuthPage || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, options.required]);

  const login = (email: string) => {
    const foundUser = mockUsers.find(u => u.email === email);
    if(foundUser) {
        localStorage.setItem('loggedInUser', email);
        setUser(foundUser);
        router.push('/dashboard');
    } else {
        console.error("User not found in mock data");
    }
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}

    