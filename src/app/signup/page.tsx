// src/app/signup/page.tsx
'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an Account"
      description="Join the community and start collecting badges."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log In"
    >
      <AuthForm type="signup" />
    </AuthLayout>
  );
}
