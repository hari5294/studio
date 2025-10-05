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
  const [users, setUsers] = useAtom(usersAtom);
  const [loading, setLoading] = useState(true);

  const user = currentUserId ? users[currentUserId] : null;

  useEffect(() => {
    // This effect handles redirection based on auth state
    if (typeof window === 'undefined') return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (user && isAuthPage) {
      // If user is logged in and tries to access login/signup, redirect to dashboard
      router.push('/dashboard');
    } else if (options.required && !user && !isAuthPage) {
      // If page requires auth and user is not logged in, redirect to login
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [user, pathname, router, options.required]);


  const login = (email: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = Object.values(users).find(u => u.email === email);
        if (existingUser) {
          // In a real app, you would verify the password here
          setCurrentUserId(existingUser.id);
          resolve(existingUser);
        } else {
          reject(new Error('No user found with that email address.'));
        }
      }, 500);
    });
  };

  const signup = (name: string, email: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
       setTimeout(() => {
        const existingUser = Object.values(users).find(u => u.email === email);
        if (existingUser) {
          reject(new Error('A user with that email already exists.'));
          return;
        }

        const newUserId = `user${Object.keys(users).length + 1}`;
        const newUser: User = {
          id: newUserId,
          name,
          email,
          emojiAvatar: '🙂',
          following: [],
        };
        
        setUsers(prev => ({ ...prev, [newUserId]: newUser }));
        setCurrentUserId(newUserId);
        resolve(newUser);
       }, 500);
    });
  };
  
  const logout = () => {
    setCurrentUserId(null);
    router.push('/login');
  };

  return { user, loading, login, signup, logout };
}
