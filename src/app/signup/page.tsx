'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sendLoginLink, loading } = useAuth();

  const handleSubmit = async (email: string) => {
    try {
      await sendLoginLink(email);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
      <AuthLayout
        title="Create an Account"
        description="Enter your email to get started. We'll send you a magic link to sign in."
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Login"
        isLoading={loading}
      >
        <AuthForm
          buttonText="Sign Up"
          onSubmit={handleSubmit}
          includeName={false}
          includePassword={false}
          isLoading={loading}
        />
      </AuthLayout>
    </>
  );
}
