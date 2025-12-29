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
    refreshToken: z.string()
        .min(1, 'Refresh token is required'),
});

type MfaForm = z.infer<typeof mfaSchema>;

export default function MfaPage() {
    const [email, setEmail] = useState<string>('');
    const { isLoading, isAuthenticated, getMfaSession, setUser, setLoading } = useAuthStore();
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

            // Get the stored login response
            const loginResponseStr = sessionStorage.getItem('mfa_login_response');
            if (!loginResponseStr) {
                throw new Error('No login session found. Please login again.');
            }

            const loginResponse = JSON.parse(loginResponseStr);

            // Verify the refresh token matches what was sent from backend
            if (loginResponse.refresh_token && data.refreshToken === loginResponse.refresh_token) {
                // Authentication successful - transform user data to frontend format
                const user = {
                    id: loginResponse.user.id,
                    email: loginResponse.user.email,
                    firstName: loginResponse.user.first_name ?? '',
                    lastName: loginResponse.user.last_name ?? '',
                    role: loginResponse.user.role ?? '',
                    department: loginResponse.user.department,
                    position: loginResponse.user.position,
                    avatar: loginResponse.user.avatar,
                    isActive: loginResponse.user.is_active ?? true,
                    createdAt: loginResponse.user.created_at ?? new Date().toISOString(),
                    lastLogin: loginResponse.user.last_login,
                    permissions: loginResponse.user.permissions,
                };

                // Store tokens in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_token', loginResponse.access_token);
                    localStorage.setItem('refresh_token', data.refreshToken);
                    // Note: setUser will handle storing the user object in localStorage

                    // Clear MFA session
                    sessionStorage.removeItem('mfa_pre_auth_token');
                    sessionStorage.removeItem('mfa_email');
                    sessionStorage.removeItem('mfa_login_response');
                }

                // Update Zustand store - this will also store user in localStorage
                setUser(user);
                setLoading(false);

                toast.success('Authentication successful! Welcome back.');

                // Small delay to ensure state is fully updated before navigation
                setTimeout(() => {
                    router.push('/dashboard');
                }, 100);
            } else {
                setLoading(false);
                toast.error('Invalid refresh token. Please try again.');
            }
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
                            Enter the refresh token sent to <span className="font-medium">{email}</span>
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="refreshToken">Refresh Token</Label>
                            <Input
                                id="refreshToken"
                                type="text"
                                placeholder="Enter refresh token "
                                {...register('refreshToken')}
                                className={errors.refreshToken ? 'border-destructive' : ''}
                                autoFocus
                            />
                            {errors.refreshToken && (
                                <p className="text-sm text-destructive">{errors.refreshToken.message}</p>
                            )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Enter Verification token</p>
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
