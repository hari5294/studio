
'use client';

import {
  Auth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  ReactNode,
  useEffect,
} from 'react';
import { useAtom } from 'jotai';

import { FirebaseProvider, initializeFirebase, useAuth } from '.';
import { currentUserIdAtom, usersAtom, User } from '@/lib/mock-data';


export interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const { app, firestore, auth } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={app}
      firestore={firestore}
      auth={auth}
    >
      <AuthWrapper>{children}</AuthWrapper>
    </FirebaseProvider>
  );
}

function AuthWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [, setCurrentUserId] = useAtom(currentUserIdAtom);
  const [users, setUsers] = useAtom(usersAtom);


  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setCurrentUserId(user.uid);
        
        // Check if user profile exists, if not create a mock one
        if (!users[user.uid]) {
            const newUser: User = {
                id: user.uid,
                name: user.displayName || `User ${user.uid.substring(0,6)}`,
                email: user.email || `${user.uid.substring(0,6)}@example.com`,
                emojiAvatar: '🙂',
                following: [],
            };
            setUsers(prev => ({...prev, [user.uid]: newUser}));
        }

      } else {
        // User is signed out.
        signInAnonymously(auth).catch((error) => {
            console.error('Error signing in anonymously:', error);
        });
      }
    });

    return () => unsubscribe();
  }, [auth, setCurrentUserId, setUsers, users]);

  return <>{children}</>;
}
