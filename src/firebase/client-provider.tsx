
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
    // This is a placeholder for real Firebase Auth.
    // In a real app, you might not need this if your useAuth hook
    // and route protection are sufficient.
    // This simply syncs the mock user ID with a placeholder user.
    if (!auth) {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId) {
            setCurrentUserId(storedUserId);
        }
    }
  }, [auth, setCurrentUserId, setUsers, users]);

  return <>{children}</>;
}
