'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { User } from '@/lib/mock-data';
import { emitPermissionError } from '@/lib/error-emitter';

type UseAuthOptions = {
  required?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (e) {
          emitPermissionError(e, userRef, 'get', null);
          setLoading(false);
          return;
        }

        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() } as User);
        } else {
           // If user doesn't exist, create them
           const userProfile: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Anonymous User',
                emojiAvatar: '😀',
                following: [],
            };
            try {
                await setDoc(userRef, userProfile);
                setUser(userProfile);
            } catch (e) {
                emitPermissionError(e, userRef, 'create', userProfile);
            }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = ['/login'].includes(pathname);

    if (options.required && !user && !isAuthPage) {
      router.push('/login');
    } else if (user && (isAuthPage || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, options.required]);

  const loginWithGoogle = async (): Promise<User | null> => {
    if (!auth || !firestore) throw new Error('Auth not initialized.');
    setLoading(true);

    const provider = new GoogleAuthProvider();
    
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      let userProfile: User;
      if (userSnap.exists()) {
        userProfile = { id: userSnap.id, ...userSnap.data() } as User;
      } else {
        userProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'New User',
          emojiAvatar: '😀',
          following: [],
        };
        await setDoc(userRef, userProfile);
      }
      
      setUser(userProfile);
      router.push('/dashboard');
      return userProfile;
    } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return { user, loading, loginWithGoogle, logout };
}
