'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  type DocumentData,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UseCollectionOptions<T> = {
  // Add any options if needed in the future
};

export function useCollection<T = DocumentData>(
  pathOrRef: string | CollectionReference | Query | null,
  options?: UseCollectionOptions<T>
) {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (pathOrRef === null) {
      setData(null);
      setLoading(false);
      return;
    }

    const ref =
      typeof pathOrRef === 'string' ? collection(db, pathOrRef) : pathOrRef;

    const q = query(ref);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'list',
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
