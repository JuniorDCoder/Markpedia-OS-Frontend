'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import SOPNewClient from "@/components/sections/resources/sops/new/SOPNewClient";

export default function SOPNewPage() {
    const { user, isAuthenticated } = useAuthStore();

    // Role-based access check
    if (user && !['CEO', 'Admin', 'HR', 'Manager'].includes(user.role || '')) {
        redirect('/resources/policies');
    }

    if (!user) {
        return null;
    }

    return <SOPNewClient user={user} />;
}