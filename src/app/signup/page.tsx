'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/lib/mock-data';
import { useState } from 'react';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { Button } from '@/components/ui/button';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.536,44,29.891,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup, loginWithGoogle, loading } = useAuth();
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

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      handleSignupComplete(user);
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
        <div className="grid gap-4">
          <Button variant="outline" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <AuthForm
            buttonText="Sign Up"
            onSubmit={handleSubmit}
            includeName={true}
            includePassword={true}
            isLoading={loading}
          />
        </div>
      </AuthLayout>
    </>
  );
}
