export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class to represent Firestore permission errors.
 * This class is intended to be thrown in a development environment
 * to provide a rich, contextual error message in the Next.js error overlay.
 */
export class FirestorePermissionError extends Error {
  /**
   * The context of the security rule that failed.
   * This will be serialized to JSON and displayed in the error message.
   */
  public securityRuleContext: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const jsonContext = JSON.stringify(context, null, 2);

    super(
      `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${jsonContext}

To fix this, you have two options:
1. Update your firestore.rules to allow this operation.
2. If the operation should be allowed, ensure the client-side code is sending the correct data and the user has the right permissions.`
    );
    this.name = 'FirestorePermissionError';
    this.securityRuleContext = context;

    // This is necessary to make 'instanceof' work correctly in ES5
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
