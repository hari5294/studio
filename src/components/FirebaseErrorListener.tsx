'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a development environment, we want to throw the error
      // to make it visible in the Next.js error overlay. This provides
      // a better developer experience for debugging security rules.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // In production, you might want to log this to a monitoring service
        // or display a generic error message to the user.
        console.error('Firestore Permission Error:', error.message);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything
}
