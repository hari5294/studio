import { FirestorePermissionError } from '@/firebase/errors';
import { EventEmitter } from 'events';

class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();

export function emitPermissionError(
  error: unknown,
  ref: any,
  operation: any,
  resource: any
) {
  if (
    error instanceof Error &&
    (error.message.includes('permission-denied') ||
      error.message.includes('insufficient permissions'))
  ) {
    const permissionError = new FirestorePermissionError(
      error.message,
      ref,
      operation,
      resource
    );
    errorEmitter.emit('permission-error', permissionError);
  } else {
    // Re-throw other errors
    throw error;
  }
}
