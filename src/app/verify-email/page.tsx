'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                       <Mail className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Check your email</CardTitle>
                    <CardDescription>
                        We've sent a magic sign-in link to <span className="font-bold text-foreground">{email || 'your email address'}</span>. Click the link to complete your sign-in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="mt-4 text-center text-sm">
                        Didn't get an email?{' '}
                        <Link href="/login" className="underline">
                            Try again
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
