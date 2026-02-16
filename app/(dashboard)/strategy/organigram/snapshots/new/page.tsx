'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SnapshotNewClient from '@/components/sections/organigram/snapshots/new/SnapshotNewClient';
import { useAuthStore } from '@/store/auth';
import { isAdminLikeRole } from '@/lib/roles';
import { LoadingSpinner } from '@/components/ui/loading';

export default function SnapshotNewPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user && !isAdminLikeRole(user.role)) {
            router.push('/strategy/organigram');
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAdminLikeRole(user.role)) {
        return null;
    }

    return <SnapshotNewClient user={user} />;
}