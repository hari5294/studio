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

// Export the initialization function and the provider.
// These are used in `app/layout.tsx` to wrap the app.
export {
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
