
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';

export type AppUser = User & {
    emojiAvatar?: string;
    following?: string[];
    name?: string;
};

export function useUser(options: { required?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Combine Firebase auth user data with Firestore profile data
            const firestoreData = docSnap.data();
            setUser({
              ...firebaseUser,
              name: firestoreData.name || firebaseUser.displayName,
              email: firestoreData.email || firebaseUser.email,
              emojiAvatar: firestoreData.emojiAvatar,
              following: firestoreData.following || [],
            });
          } else {
             // User exists in Auth but not Firestore, use Auth data as base
            setUser(firebaseUser);
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  return { user, loading };
}
