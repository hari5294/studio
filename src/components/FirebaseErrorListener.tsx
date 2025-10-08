
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This component listens for permission errors and throws them to be caught
// by Next.js's error overlay in development.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // In a real app, you might log this to a service like Sentry.
      // For development, we throw it to show the Next.js overlay.
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => { throw error; }, 0);
      }
    };

    errorEmitter.on('permission-error', handleError);

  }, []);

  return null; // This component doesn't render anything.
}
