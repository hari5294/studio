'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { User } from '@/lib/mock-data';

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
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() } as User);
        } else {
          // If user doc doesn't exist (e.g., first Google login), create it
          const newUserProfile: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Anonymous User',
            emojiAvatar: '😀',
            following: [],
          };
          await setDoc(userRef, newUserProfile);
          setUser(newUserProfile);
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

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (options.required && !user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, options.required]);

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
        const userData = { id: userSnap.id, ...userSnap.data() } as User;
        setUser(userData);
        return userData;
      } else {
         throw new Error('User profile not found.');
      }

    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    if (!auth || !firestore) {
      throw new Error('Auth not initialized.');
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      auth.tenantId = null;
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() } as User;
        setUser(userData);
        return userData;
      } else {
        // This case is handled by onAuthStateChanged, but we can do it here too for immediate UI update
        const newUserProfile: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Google User',
            emojiAvatar: '😀',
            following: [],
        };
        await setDoc(userRef, newUserProfile);
        setUser(newUserProfile);
        return newUserProfile;
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
        // but we set it here to update the UI immediately
        setUser(newUser);
        return newUser;

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

  return { user, loading, login, signup, logout, loginWithGoogle };
}
