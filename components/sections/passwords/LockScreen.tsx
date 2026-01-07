'use client';

import { useState, useEffect } from 'react';
import { usePasswordStore } from '@/lib/stores/password-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function LockScreen() {
    const { hasVault, unlock, setMasterPassword, checkVaultStatus } = usePasswordStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingVault, setIsCheckingVault] = useState(true);

    // Check backend status on mount to see if vault really exists
    useEffect(() => {
        const check = async () => {
            await checkVaultStatus();
            setIsCheckingVault(false);
        };
        check();
    }, [checkVaultStatus]);

    if (isCheckingVault) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Checking vault status...</p>
                </div>
            </div>
        );
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await unlock(password);
            if (success) {
                toast.success('Vault unlocked');
            } else {
                setError('Incorrect password or corrupted data');
                toast.error('Failed to unlock vault');
            }
        } catch (e) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await setMasterPassword(password);
            toast.success('Master password set successfully');
        } catch (e) {
            toast.error('Failed to create encrypted vault');
        } finally {
            setIsLoading(false);
        }
    };

    // If no vault exists, show setup screen
    if (!hasVault) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle>Setup Master Password</CardTitle>
                        <CardDescription>
                            Create a strong master password to secure your vault.
                            This password is required to access your stored credentials.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSetup}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive text-center">{error}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading || !password || !confirmPassword}>
                                {isLoading ? 'Setting up...' : 'Create Master Password'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[600px]">
            <Card className="w-full max-w-md shadow-lg border-2">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-muted p-4 rounded-full w-fit mb-4">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <CardTitle>Vault Locked</CardTitle>
                    <CardDescription>
                        Enter your master password to unlock your vault.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleUnlock}>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Master Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading || !password}>
                            {isLoading ? 'Unlocking...' : 'Unlock Vault'} <Unlock className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

