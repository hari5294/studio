
'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/lib/mock-data';
import { useState } from 'react';
import { EmojiBurst } from '@/components/effects/emoji-burst';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup, loading } = useAuth();
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);


  const handleSignupComplete = (newUser: User) => {
    toast({
      title: 'Account Created!',
      description: `Welcome, ${newUser.name}!`,
    });

    setBurstEmojis('👋');
    setTimeout(() => router.push('/dashboard'), 1500);
  }

  const handleSubmit = async (email: string, password?: string, name?: string) => {
    if (!name || !password) {
       toast({ title: 'Name and password are required for sign up.', variant: 'destructive'});
       return;
    }
    try {
      const newUser = await signup(name, email, password);
      handleSignupComplete(newUser);
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
      <AuthLayout
        title="Create an Account"
        description="Enter your details to create a new account."
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Login"
      >
        <AuthForm
          buttonText="Sign Up"
          onSubmit={handleSubmit}
          includeName={true}
          includePassword={true}
          isLoading={loading}
        />
      </AuthLayout>
    </>
  );
}
