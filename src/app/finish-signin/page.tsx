'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { EmojiBadgeLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmojiBurst } from '@/components/effects/emoji-burst';
import { useIsClient } from '@/hooks/use-is-client';

export default function FinishSignInPage() {
    const router = useRouter();
    const { completeLogin } = useAuth();
    const { toast } = useToast();
    const isClient = useIsClient();
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [burstEmojis, setBurstEmojis] = useState<string | null>(null);

    useEffect(() => {
        if (!isClient) return;

        const complete = async () => {
            try {
                const user = await completeLogin(window.location.href);
                if (user) {
                    toast({
                        title: 'Login Successful',
                        description: `Welcome, ${user.name}!`,
                    });
                    setBurstEmojis(user.emojiAvatar || '👋');
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1500);
                } else {
                    throw new Error('Could not complete sign in.');
                }
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
                setStatus('error');
                toast({
                    title: 'Login Failed',
                    description: err.message,
                    variant: 'destructive',
                });
            }
        };

        complete();

    }, [isClient, completeLogin, router, toast]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                     <div className="text-center space-y-4 pt-6">
                        <CardTitle className="text-2xl font-headline">Signing you in...</CardTitle>
                        <CardDescription>
                            Please wait while we verify your magic link.
                        </CardDescription>
                        <div className="flex justify-center pt-4">
                            <Skeleton className="h-10 w-48" />
                        </div>
                    </div>
                );
            case 'success':
                 return (
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="text-6xl">🎉</div>
                        </div>
                        <CardTitle className="text-2xl font-headline">Success!</CardTitle>
                        <CardDescription>
                            You're all signed in. Redirecting you now...
                        </CardDescription>
                    </CardHeader>
                );
            case 'error':
                 return (
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <EmojiBadgeLogo className="h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Sign-in Failed</CardTitle>
                        <CardDescription>
                            {error || "This link is invalid or expired."}
                        </CardDescription>
                    </CardHeader>
                );
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative">
            {burstEmojis && <EmojiBurst emojis={burstEmojis} />}
            <Card className="mx-auto w-full max-w-sm">
                <CardContent className="pt-6">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
