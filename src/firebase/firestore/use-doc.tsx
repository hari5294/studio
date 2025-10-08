
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
       async (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref ? ref.path : '']);

  return { data, loading, error };
}
