'use client';

import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, loading } = useAuth();

  const handleSubmit = async (email: string, password?: string) => {
    if (!password) return; // Should be handled by form validation
    try {
      const user = await login(email, password);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
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
      />
    </AuthLayout>
  );
}
