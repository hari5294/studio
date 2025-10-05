'use client';

import { useState } from 'react';
import { AuthForm, AuthLayout } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { toast } = useToast();
  const { loginOrSignup, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (email: string) => {
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await loginOrSignup(email, password);
      // The useAuth hook will handle redirection on successful login/signup
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome to EmojiBadge!"
      description="Enter your email and password to continue. If you don't have an account, one will be created for you."
      isLoading={loading}
    >
        <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            handleSubmit(email);
        }} className="grid gap-4">
            <AuthForm
                buttonText="Sign In / Sign Up"
                onSubmit={() => {}} // This is handled by the form's onSubmit
                includePassword
                isLoading={loading}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
            />
        </form>
    </AuthLayout>
  );
}
