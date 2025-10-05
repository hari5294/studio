'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmojiBadgeLogo } from '@/components/icons';
import { Separator } from '../ui/separator';

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
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,20C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

type AuthLayoutProps = {
    children: React.ReactNode;
    title: string;
    description: string;
    footerText: string;
    footerLink: string;
    footerLinkText: string;
    onGoogleSignIn?: (() => void) | null;
    isLoading?: boolean;
}

export function AuthLayout({ children, title, description, footerText, footerLink, footerLinkText, onGoogleSignIn, isLoading }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                       <EmojiBadgeLogo className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {children}
                    </div>
                     <div className="mt-4 text-center text-sm">
                        {footerText}{' '}
                        <Link href={footerLink} className="underline">
                            {footerLinkText}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

type AuthFormProps = {
    buttonText: string;
    onSubmit: (email: string, password?: string, name?: string) => void;
    includeName?: boolean;
    includePassword?: boolean;
    isLoading?: boolean;
}

export function AuthForm({ buttonText, onSubmit, includeName = false, includePassword = false, isLoading = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, name);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
        {includeName && (
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                />
            </div>
        )}
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            />
        </div>
        {includePassword && (
          <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : buttonText}
        </Button>
    </form>
  );
}
