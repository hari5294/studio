
'use client';

import {
  Auth,
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
    
    // This is a simplified auth listener for the mock data setup.
    // In a real Firebase app, you would fetch the user profile from Firestore here.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setCurrentUserId(user.uid);
        
        // If the user's profile doesn't exist in our mock data, create one.
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
        // User is signed out. Clear the user ID.
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, [auth, setCurrentUserId, setUsers, users]);

  return <>{children}</>;
}
