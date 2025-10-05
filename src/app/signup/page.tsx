'use client';

import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { AuthLayout, AuthForm } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { usersAtom, currentUserIdAtom, User } from '@/lib/mock-data';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup, loading } = useAuth();
  const [, setUsers] = useAtom(usersAtom);
  const [,setCurrentUserId] = useAtom(currentUserIdAtom);

  const handleSubmit = async (email: string, name?: string) => {
    if (!name) {
       toast({ title: 'Name is required for sign up.', variant: 'destructive'});
       return;
    }
    try {
      const newUser = await signup(name, email);
      // Add the new user to our mock data
      setUsers(prev => ({...prev, [newUser.id]: newUser}));
      setCurrentUserId(newUser.id);

      toast({
        title: 'Account Created!',
        description: `Welcome, ${newUser.name}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
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
        isLoading={loading}
      />
    </AuthLayout>
  );
}
