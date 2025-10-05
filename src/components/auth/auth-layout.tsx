'use client';

import Link from 'next/link';
import { EmojiBadgeLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
};

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  useAuth({ required: false }); // Redirects if already logged in

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
            <div className="mt-6 text-center text-sm">
                {footerText}{' '}
                <Link href={footerLink} className="underline">
                {footerLinkText}
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
