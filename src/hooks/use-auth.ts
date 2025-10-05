
'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { currentUserIdAtom, User } from '@/lib/mock-data';

type UseAuthOptions = {
  required?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  const [currentUserId, setCurrentUserId] = useAtom(currentUserIdAtom);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rely on Firebase's onAuthStateChanged in the provider
    // to set the initial user state.
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
        setCurrentUserId(storedUserId);
    }
    setLoading(false);
  }, [setCurrentUserId]);

   useEffect(() => {
    if (loading || !firestore || !currentUserId) {
        if (!currentUserId) setUser(null);
        return;
    };

    const fetchUser = async () => {
        const userRef = doc(firestore, 'users', currentUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setUser(userSnap.data() as User);
        } else {
            setUser(null);
        }
    };
    fetchUser();

   }, [currentUserId, firestore, loading]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (options.required && !currentUserId && !isAuthPage) {
      router.push('/login');
    } else if (currentUserId && isAuthPage) {
      router.push('/dashboard');
    }
  }, [currentUserId, loading, pathname, router, options.required]);

  const login = async (email: string, password?: string): Promise<User> => {
    if (!auth || !firestore || !password) {
      throw new Error('Auth not initialized or password missing.');
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        setUser(userData);
        setCurrentUserId(firebaseUser.uid);
        localStorage.setItem('currentUserId', firebaseUser.uid);
        return userData;
      } else {
         throw new Error('User profile not found.');
      }

    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password?: string): Promise<User> => {
    if (!auth || !firestore || !password) {
      throw new Error('Auth not initialized or password missing.');
    }
    setLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: name });
        
        const newUser: User = {
            id: firebaseUser.uid,
            name: name,
            email: email,
            emojiAvatar: '😀',
            following: [],
        };

        // The user document is created by onAuthStateChanged listener in provider
        setUser(newUser);
        setCurrentUserId(newUser.id);
        localStorage.setItem('currentUserId', newUser.id);
        return newUser;

    } finally {
        setLoading(false);
    }
  };
  
  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentUserId(null);
    localStorage.removeItem('currentUserId');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, signup, logout };
}
