'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sendLoginLink, loading } = useAuth();

  const handleSubmit = async (email: string) => {
    try {
      await sendLoginLink(email);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
      <AuthLayout
        title="Welcome!"
        description="Enter your email to receive a magic sign-in link."
        footerText="Don't have an account?"
        footerLink="/signup"
        footerLinkText="Sign Up"
        isLoading={loading}
      >
        <AuthForm
          buttonText="Send Magic Link"
          onSubmit={handleSubmit}
          isLoading={loading}
          includePassword={false}
        />
      </AuthLayout>
    </>
  );
}
