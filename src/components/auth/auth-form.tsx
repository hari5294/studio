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
    footerText: string;
    footerLink: string;
    footerLinkText: string;
}

export function AuthLayout({ children, title, description, footerText, footerLink, footerLinkText }: AuthLayoutProps) {
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
                    {children}
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
    onSubmit: (email: string, name?: string) => void;
    includeName?: boolean;
}

export function AuthForm({ buttonText, onSubmit, includeName = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(email, name);
    setIsLoading(false);
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
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : buttonText}
        </Button>
    </form>
  );
}
