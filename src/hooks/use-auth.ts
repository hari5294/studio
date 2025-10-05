'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { currentUserIdAtom, usersAtom, User } from '@/lib/mock-data';

type UseAuthOptions = {
  required?: boolean; // Does the page require authentication?
};

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUserId, setCurrentUserId] = useAtom(currentUserIdAtom);
  const [users] = useAtom(usersAtom);
  
  // Use a local loading state to simulate async behavior
  const [loading, setLoading] = useState(true);

  const user = currentUserId ? users[currentUserId] : null;

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
        setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentUserId]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === 'undefined') return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (options.required && !currentUserId && !isAuthPage) {
      router.push('/login');
    } else if (currentUserId && isAuthPage) {
      router.push('/dashboard');
    }
  }, [currentUserId, loading, pathname, router, options.required]);

  const login = (email: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
            const foundUser = Object.values(users).find(u => u.email === email);
            if (foundUser) {
                // In a real app, you'd verify the password here.
                // For mock data, we just check if it exists.
                setCurrentUserId(foundUser.id);
                resolve(foundUser);
            } else {
                reject(new Error('User not found or password incorrect.'));
            }
            setLoading(false);
        }, 500);
    });
  };

  const signup = (name: string, email: string, password?: string): Promise<User> => {
     return new Promise((resolve, reject) => {
         setLoading(true);
        setTimeout(() => {
            if (Object.values(users).some(u => u.email === email)) {
                reject(new Error('User with this email already exists'));
                setLoading(false);
                return;
            }
            const newUserId = `user${Object.keys(users).length + 1}`;
            const newUser: User = {
                id: newUserId,
                name,
                email,
                emojiAvatar: '😀',
                following: []
            };
            // The component handles adding the user to the atom state.
            // In a real app, you'd save the new user to the database here.
            resolve(newUser);
            setLoading(false);
        }, 500);
    });
  };
  
  const logout = () => {
    setCurrentUserId(null);
    router.push('/login');
  };

  return { user, loading, login, signup, logout };
}
