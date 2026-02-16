'use client';

import JournalClient from '@/components/sections/JournalClient';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import { User as JournalUser } from '@/types/journal';

export default function JournalPage() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const journalUser: JournalUser = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        department: user.department || '',
        createdAt: user.createdAt || new Date().toISOString(),
        isActive: user.isActive,
    };

    return <JournalClient user={journalUser} />;
}