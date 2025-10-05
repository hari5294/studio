
'use client';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { doc, setDoc } from 'firebase/firestore';

import { FirebaseProvider, initializeFirebase, useAuth, useFirestore } from '.';
import { currentUserIdAtom, User } from '@/lib/mock-data';

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
  const [, setCurrentUserId] = useAtom(currentUserIdAtom);

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setCurrentUserId(firebaseUser.uid);
        localStorage.setItem('currentUserId', firebaseUser.uid);

        // This creates or updates a user profile document in Firestore upon login.
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const userProfile: Partial<User> = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
        };
        // Add display name if it exists and it's the first time
        if (firebaseUser.displayName) {
          userProfile.name = firebaseUser.displayName;
        }

        try {
          await setDoc(userRef, userProfile, { merge: true });
        } catch (e) {
          console.error("Error creating/updating user document:", e);
        }
        
      } else {
        setCurrentUserId(null);
        localStorage.removeItem('currentUserId');
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, setCurrentUserId]);

  return <>{children}</>;
}
