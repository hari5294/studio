// src/app/login/page.tsx
'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      description="Enter your credentials to access your account."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign Up"
    >
      <AuthForm type="login" />
    </AuthLayout>
  );
}
