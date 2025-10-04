'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function GoogleSignInButton({ onSuccess }: { onSuccess: () => void }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const additionalInfo = getAdditionalUserInfo(result);
      
      // If the user is new, create a document in Firestore
      if (additionalInfo?.isNewUser) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
            emojiAvatar: '',
            following: [],
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Sign-in Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
}
