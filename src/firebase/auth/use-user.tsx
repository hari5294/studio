'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/firestore-data';

export type CombinedUser = FirebaseUser & AppUser;

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user, listen to their document in Firestore
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Combine auth user and firestore user data
            const appUser = docSnap.data() as AppUser;
            setUser({ ...firebaseUser, ...appUser });
          } else {
            // This case can happen briefly during sign-up
             setUser(firebaseUser as CombinedUser);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user document:", error);
            setUser(firebaseUser as CombinedUser);
            setLoading(false);
        });
        
        return () => unsubscribeFirestore();
      } else {
        // No user, clear state
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, loading };
}
