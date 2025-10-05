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
    // This effect handles redirection based on auth state
    if (loading || typeof window === 'undefined') return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (options.required && !user && !isAuthPage) {
      // If page requires auth and user is not logged in (and it's not an auth page already), redirect to login
      router.push('/login');
    } else if (user && isAuthPage) {
      // If user is logged in and tries to access login/signup, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, options.required]);

  const login = (email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
            const foundUser = Object.values(users).find(u => u.email === email);
            if (foundUser) {
                setCurrentUserId(foundUser.id);
                resolve(foundUser);
            } else {
                reject(new Error('User not found'));
            }
            setLoading(false);
        }, 500);
    });
  };

  const signup = (name: string, email: string): Promise<User> => {
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
            // The component handles adding the user to the atom state
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
