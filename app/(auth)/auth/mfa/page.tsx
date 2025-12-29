'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuthStore } from '@/store/auth';
import { Shield } from 'lucide-react';

const mfaSchema = z.object({
    code: z.string()
        .length(6, 'Verification code must be 6 digits'),
});

type MfaForm = z.infer<typeof mfaSchema>;

export default function MfaPage() {
    const [email, setEmail] = useState<string>('');
    const { isLoading, isAuthenticated, getMfaSession, setUser, setLoading, verifyMfa } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        if (isAuthenticated) {
            router.push('/dashboard');
            return;
        }

        // Check if MFA session exists
        const mfaSession = getMfaSession();
        if (!mfaSession) {
            toast.error('No MFA session found. Please login again.');
            router.push('/auth/login');
            return;
        }

        setEmail(mfaSession.email);
    }, [isAuthenticated, getMfaSession, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MfaForm>({
        resolver: zodResolver(mfaSchema),
    });

    const onSubmit = async (data: MfaForm) => {
        try {
            setLoading(true);
            await verifyMfa(data.code);
            toast.success('Authentication successful! Welcome back.');
            router.push('/dashboard');
        } catch (error: any) {
            setLoading(false);
            const msg = error?.message || 'Authentication failed';
            toast.error(msg);
        }
    };

    // Show loading state while checking MFA session
    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-primary font-bold">Multi-Factor Authentication</CardTitle>
                        <CardDescription>
                            Enter the 6-digit verification code sent to <span className="font-medium">{email}</span>
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="Enter 6-digit code"
                                {...register('code')}
                                className={errors.code ? 'border-destructive' : ''}
                                maxLength={6}
                                autoFocus
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Check your email for the verification code.</p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify and Continue'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            <button
                                type="button"
                                onClick={() => router.push('/auth/login')}
                                className="text-primary hover:underline"
                            >
                                Back to login
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
