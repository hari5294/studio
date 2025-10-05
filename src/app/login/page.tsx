'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { User } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, loading } = useAuth();
  const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

  const handleLoginComplete = (user: User) => {
    toast({
      title: 'Login Successful',
      description: `Welcome back, ${user.name}!`,
    });
    setBurstEmojis(user.emojiAvatar || '👋');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  const handleSubmit = async (email: string, password?: string) => {
    if (!password) return; // Should be handled by form validation
    try {
      const user = await login(email, password);
      handleLoginComplete(user);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
      <AuthLayout
        title="Welcome Back!"
        description="Enter your email and password to sign in."
        footerText="Don't have an account?"
        footerLink="/signup"
        footerLinkText="Sign Up"
      >
        <AuthForm
          buttonText="Login"
          onSubmit={handleSubmit}
          isLoading={loading}
          includePassword={true}
        />
      </AuthLayout>
    </>
  );
}
