'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UseDocOptions = {
  // Add any options if needed in the future
};

export function useDoc<T = DocumentData>(
  pathOrRef: string | DocumentReference | null,
  options?: UseDocOptions
) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (pathOrRef === null) {
      setData(null);
      setLoading(false);
      return;
    }

    const ref =
      typeof pathOrRef === 'string' ? doc(db, pathOrRef) : pathOrRef;

    const unsubscribe = onSnapshot(
      ref,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
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
  }, [db, pathOrRef, options]);

  return { data, loading, error };
}
