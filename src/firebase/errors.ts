import { DocumentReference, DocumentData } from 'firebase/firestore';

export type FirestoreOperation = 'get' | 'list' | 'create' | 'update' | 'delete';

export class FirestorePermissionError extends Error {
  public ref: DocumentReference<DocumentData, DocumentData> | null;
  public operation: FirestoreOperation;
  public resource?: DocumentData | null;

  constructor(
    message: string,
    ref: DocumentReference<DocumentData, DocumentData> | null,
    operation: FirestoreOperation,
    resource: DocumentData | null = null
  ) {
    super(message);
    this.name = 'FirestorePermissionError';
    this.ref = ref;
    this.operation = operation;
    this.resource = resource;
  }
}

// You can add more specific error types here if needed
