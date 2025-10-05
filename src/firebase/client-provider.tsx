
'use client';

import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider, useAuth, useFirestore } from '.';
import { User } from '@/lib/mock-data';
import { firebaseConfig } from './config';
import { emitPermissionError } from '@/lib/error-emitter';


function initializeClientFirebase(): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const apps = getApps();
  if (apps.length) {
    const app = apps[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  } else {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }
}

export interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { app, firestore, auth } = initializeClientFirebase();

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
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        let userSnap;

        try {
            userSnap = await getDoc(userRef);
        } catch (e) {
            emitPermissionError(e, userRef, 'get', null);
            return;
        }

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
                emitPermissionError(e, userRef, 'create', userProfile);
            }
        }
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return <>{children}</>;
}
