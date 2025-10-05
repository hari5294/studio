'use client';

import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { useEffect, useReducer, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';

interface State<T> {
  loading: boolean;
  data?: T[];
  error?: Error;
}

type Action<T> =
  | { type: 'loading' }
  | { type: 'success'; payload: T[] }
  | { type: 'error'; payload: Error };

export function useCollection<T = DocumentData>(
  query: Query<T> | CollectionReference<T> | null
) {
  const mounted = useRef(true);

  const reducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...state, loading: true };
      case 'success':
        return {
          ...state,
          loading: false,
          data: action.payload,
          error: undefined,
        };
      case 'error':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    loading: query !== null,
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    mounted.current = true;
    if (!query) {
      dispatch({ type: 'success', payload: [] });
      return;
    }
    dispatch({ type: 'loading' });
    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        if (!mounted.current) return;
        const data = querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as T)
        );
        dispatch({ type: 'success', payload: data });
      },
      (error) => {
        if (!mounted.current) return;
        dispatch({ type: 'error', payload: error });
      }
    );

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [query]);

  return state;
}
