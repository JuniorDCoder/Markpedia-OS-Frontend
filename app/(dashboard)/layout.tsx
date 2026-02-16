'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore, initializeAuth } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import { useSessionTimeout } from '@/hooks/use-session-timeout';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Initialize session timeout tracking (handles auto-logout)
    useSessionTimeout();

    // Initialize auth on client side only
    useEffect(() => {
        setIsClient(true);
        initializeAuth();
    }, []);

    useEffect(() => {
        // Only redirect when we're sure about the auth state and we're on client
        if (isClient && isInitialized && !isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router, isInitialized, isClient]);

    // Show loading spinner while initializing
    if (!isClient || !isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="container mx-auto px-2 md:px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}