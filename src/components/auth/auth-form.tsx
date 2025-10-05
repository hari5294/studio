'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

// AuthForm is no longer used for form inputs but kept for potential future use or alternative auth methods.
export function AuthForm() {
  return null;
}
