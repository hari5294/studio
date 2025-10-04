import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

// This is a workaround to type the EventEmitter
// See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41147
type TypedEventEmitter<T> = Omit<EventEmitter, 'on' | 'off' | 'emit'> & {
  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): any;
  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): any;
  emit<K extends keyof T>(event: K, payload: T[K]): any;
};

// Define the event map
type EventMap = {
  'permission-error': FirestorePermissionError;
};

// Create a typed event emitter
export const errorEmitter =
  new EventEmitter() as TypedEventEmitter<EventMap>;
