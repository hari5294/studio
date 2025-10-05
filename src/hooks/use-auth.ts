'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

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
          // This case will be handled on sign-in completion now
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

    const isAuthPage = ['/login', '/signup', '/verify-email', '/finish-signin'].includes(pathname);

    if (options.required && !user && !isAuthPage) {
      router.push('/login');
    } else if (user && (isAuthPage || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, options.required]);

  const sendLoginLink = async (email: string) => {
    if (!auth) throw new Error('Auth not initialized.');
    setLoading(true);
    const actionCodeSettings = {
      url: `${window.location.origin}/finish-signin`,
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (href: string): Promise<User | null> => {
     if (!auth || !firestore || !isSignInWithEmailLink(auth, href)) {
      throw new Error('Invalid sign-in link.');
    }
    setLoading(true);
    let email = window.localStorage.getItem(EMAIL_FOR_SIGN_I_KEY);
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the email again. For simplicity,
      // we'll throw an error here. A real app would prompt for it.
      setLoading(false);
      throw new Error('Sign-in email not found. Please try signing in on the same device.');
    }

    try {
      const userCredential = await signInWithEmailLink(auth, email, href);
      const firebaseUser = userCredential.user;
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);

      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userProfile: User;

      if (userSnap.exists()) {
        userProfile = { id: userSnap.id, ...userSnap.data() } as User;
      } else {
        userProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || email.split('@')[0] || 'Anonymous User',
          emojiAvatar: '😀',
          following: [],
        };
        await setDoc(userRef, userProfile);
      }
      
      setUser(userProfile);
      return userProfile;
    } catch(e) {
      // Let's assume errors here could be permission related during get/set
      emitPermissionError(e, null, 'create', null);
      throw e;
    } finally {
      setLoading(false);
    }
  }
  
  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return { user, loading, sendLoginLink, completeLogin, logout };
}
