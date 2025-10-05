'use client';

import type { DocumentData, DocumentReference } from 'firebase/firestore';
import { useEffect, useReducer, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';

interface State<T> {
  loading: boolean;
  data?: T;
  error?: Error;
}

type Action<T> =
  | { type: 'loading' }
  | { type: 'success'; payload: T | undefined }
  | { type: 'error'; payload: Error };

export function useDoc<T = DocumentData>(
  ref: DocumentReference<T> | null | undefined
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
    loading: ref !== null,
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    mounted.current = true;
    if (!ref) {
      dispatch({ type: 'success', payload: undefined });
      return;
    }
    dispatch({ type: 'loading' });
    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (!mounted.current) return;
        dispatch({
          type: 'success',
          payload: doc.exists()
            ? ({ ...doc.data(), id: doc.id } as T)
            : undefined,
        });
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
  }, [ref]);

  return state;
}
