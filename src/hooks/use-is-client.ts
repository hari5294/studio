
'use client';

import { useState, useEffect } from 'react';

// This hook is used to safely determine if the component is running on the client.
// It helps prevent hydration mismatches by ensuring that client-side-only logic
// runs after the component has mounted.
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
