import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import {
  FirebaseProvider,
  useAuth,
  useFirebaseApp,
  useFirestore,
} from './provider';
import { FirebaseClientProvider } from './client-provider';

function initializeFirebase(): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  return { app, firestore, auth };
}

// Export the initialization function and the provider.
// These are used in `app/layout.tsx` to wrap the app.
export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  // These hooks are used to get the Firebase instances.
  useFirebaseApp,
  useFirestore,
  useAuth,
  // These hooks are used to interact with Firebase services.
  useCollection,
  useDoc,
  useUser,
};
