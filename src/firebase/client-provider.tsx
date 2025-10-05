
'use client';

import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider, useAuth, useFirestore } from '.';
import { User } from '@/lib/mock-data';

// Hardcoded Firebase config to ensure it is always available on the client.
const firebaseConfig = {
  apiKey: "AIzaSyBKyV2J1wOkMQ2wEiGYRO6p675DzwL852o",
  authDomain: "badgese-e258f.firebaseapp.com",
  projectId: "badgese-e258f",
  storageBucket: "badgese-e258f.appspot.com",
  messagingSenderId: "877963955625",
  appId: "1:877963955625:web:a2-1674fc078a0e30bc48b8",
  measurementId: "G-5ZGXZRLGZL"
};


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
                // Use setDoc here to ensure the document is created with the UID as the ID
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
