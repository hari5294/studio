'use client';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';

import { firebaseConfig } from './config';

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// A lazy-loaded singleton for Firebase services
let instances: FirebaseInstances;

/**
 * Initializes and returns a singleton object containing the Firebase app,
 * auth, and firestore instances. This function ensures that Firebase services
 * are initialized only once.
 *
 * It connects to the emulators if the environment is set to development.
 *
 * @returns An object with the initialized Firebase app, auth, and firestore services.
 */
export function getFirebase(): FirebaseInstances {
  if (instances) {
    return instances;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    // It's important to check if the emulators are already connected
    // to avoid re-connecting, which would throw an error.
    if (!(auth as any).emulatorConfig) {
      connectAuthEmulator(auth, `http://${host}:9099`, {
        disableWarnings: true,
      });
    }
    if (!(firestore as any).emulatorConfig) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  instances = { app, auth, firestore };
  return instances;
}
