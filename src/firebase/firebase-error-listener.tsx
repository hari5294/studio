
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from './errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.log('Caught permission error:', {
        message: error.message,
        operation: error.operation,
        path: error.ref?.path,
        resource: error.resource,
      });

      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: `Your security rules are preventing an operation. Check the browser console for details.`,
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
