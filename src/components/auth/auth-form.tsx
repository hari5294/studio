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

type AuthLayoutProps = {
    children: React.ReactNode;
    title: string;
    description: string;
    footerText?: string;
    footerLink?: string;
    footerLinkText?: string;
    isLoading?: boolean;
}

export function AuthLayout({ children, title, description, footerText, footerLink, footerLinkText, isLoading }: AuthLayoutProps) {
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
                     {footerText && footerLink && footerLinkText && (
                        <div className="mt-4 text-center text-sm">
                            {footerText}{' '}
                            <Link href={footerLink} className="underline">
                                {footerLinkText}
                            </Link>
                        </div>
                    )}
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
    onPasswordChange?: (password: string) => void;
    onConfirmPasswordChange?: (password: string) => void;
}

export function AuthForm({ 
    buttonText, 
    onSubmit, 
    includeName = false, 
    includePassword = false, 
    isLoading = false,
    onPasswordChange,
    onConfirmPasswordChange,
}: AuthFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <>
        {includeName && (
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading}
                />
            </div>
        )}
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            />
        </div>
        {includePassword && (
          <>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={(e) => onPasswordChange?.(e.target.value)}
                disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                onChange={(e) => onConfirmPasswordChange?.(e.target.value)}
                disabled={isLoading}
                />
            </div>
          </>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : buttonText}
        </Button>
    </>
  );
}
