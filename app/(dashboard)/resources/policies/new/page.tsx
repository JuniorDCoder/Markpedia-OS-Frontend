'use client';

import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import PolicyNewClient from "@/components/sections/resources/policies/new/PolicyNewClient";

export default function PolicyNewPage() {
    const { user } = useAuthStore();

    // Role-based access check
    if (user && !['CEO', 'Admin', 'HR', 'Manager'].includes(user.role || '')) {
        redirect('/resources/policies');
    }

    if (!user) {
        return null;
    }

    return <PolicyNewClient user={user} />;
}