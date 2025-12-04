'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Building, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, isAuthenticated, isInitialized } = useAuthStore();
    const router = useRouter();

    // Fixed useEffect with proper dependency array
    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isInitialized, router]); // Added dependency array

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data.email, data.password);
            toast.success('Welcome back! Logged in successfully.');
            router.push('/dashboard');
        } catch (error: any) {
            const msg = error?.data?.detail?.[0]?.msg || error?.data?.detail || error?.message || 'Login failed';
            toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        }
    };

    // Optional: Show loading state while checking authentication
    // if (!isInitialized) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    //             <LoadingSpinner size="lg" />
    //         </div>
    //     );
    // }

    // Don't render the login form if already authenticated
    // The useEffect will handle the redirect, but this prevents flash of login page
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <p>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <Building className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-primary font-bold">Welcome back</CardTitle>
                        <CardDescription>Sign in to your Markpedia OS account</CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email')}
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    {...register('password')}
                                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/auth/forgot-password"
                                className="text-primary hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        {/*<div className="text-center text-sm text-muted-foreground">*/}
                        {/*  Do not have an account?{' '}*/}
                        {/*  <Link href="/auth/register" className="text-primary hover:underline">*/}
                        {/*    Sign up*/}
                        {/*  </Link>*/}
                        {/*</div>*/}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}