'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { currentUserIdAtom, usersAtom, User } from '@/lib/mock-data';
import { useUser } from '@/firebase'; // Using firebase hook

type UseAuthOptions = {
  required?: boolean; // Does the page require authentication?
};

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: firebaseUser, loading: firebaseLoading } = useUser();
  const [users] = useAtom(usersAtom);

  const user = firebaseUser ? users[firebaseUser.uid] : null;
  const loading = firebaseLoading;

  useEffect(() => {
    // This effect handles redirection based on auth state
    if (loading || typeof window === 'undefined') return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (user && isAuthPage) {
      // If user is logged in and tries to access login/signup, redirect to dashboard
      router.push('/dashboard');
    } else if (options.required && !user && !isAuthPage) {
      // If page requires auth and user is not logged in, they will be handled by the anon sign-in
      // No redirect to login needed for now with anonymous auth
    }
  }, [user, loading, pathname, router, options.required]);


  const login = (): Promise<User> => {
    throw new Error("Login function is not implemented for anonymous authentication.");
  };

  const signup = (): Promise<User> => {
    throw new Error("Signup function is not implemented for anonymous authentication.");
  };
  
  const logout = () => {
    // With anonymous auth, "logout" might mean creating a new anonymous user.
    // For now, we'll just refresh, which will trigger a new anonymous session if needed.
     console.log("Logout triggered");
     router.refresh();
  };

  return { user, loading, login, signup, logout };
}
