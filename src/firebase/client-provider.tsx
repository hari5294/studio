'use client';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ReactNode, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { FirebaseProvider, initializeFirebase, useAuth, useFirestore } from '.';
import { User } from '@/lib/mock-data';

export interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { app, firestore, auth } = initializeFirebase();

  return (
    <FirebaseProvider firebaseApp={app} firestore={firestore} auth={auth}>
      <AuthWrapper>{children}</AuthWrapper>
    </FirebaseProvider>
  );
}

function AuthWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  
  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // This creates or updates a user profile document in Firestore upon login.
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const userProfile: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Anonymous User',
                emojiAvatar: '😀',
                following: [],
            };
            try {
                await setDoc(userRef, userProfile);
            } catch (e) {
                console.error("Error creating user document:", e);
            }
        }
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return <>{children}</>;
}
