'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { policyService } from '@/services/companyResourcesService';
import PolicyViewClient from "@/components/sections/resources/policies/[id]/PolicyViewClient";
import { PageSkeleton } from '@/components/ui/loading';
import type { Policy } from '@/types/company-resources';

export default function PolicyViewPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPolicy = async () => {
            if (!params.id) return;
            try {
                const data = await policyService.getPolicy(params.id as string);
                setPolicy(data);
            } catch (error) {
                console.error('Error loading policy:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPolicy();
    }, [params.id]);

    if (loading) {
        return <PageSkeleton />;
    }

    if (!policy || !user) {
        notFound();
    }

    return <PolicyViewClient policy={policy} user={user} />;
}