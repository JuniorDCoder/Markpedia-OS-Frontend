'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { sopService } from '@/services/companyResourcesService';
import RunSOPClient from "@/components/sections/resources/sops/[id]/run/RunSOPClient";
import { PageSkeleton } from '@/components/ui/loading';
import type { SOP } from '@/types/company-resources';

export default function RunSOPPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [sop, setSop] = useState<SOP | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSOP = async () => {
            if (!params.id) return;
            try {
                const data = await sopService.getSOP(params.id as string);
                setSop(data);
            } catch (error) {
                console.error('Error loading SOP:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSOP();
    }, [params.id]);

    if (loading) {
        return <PageSkeleton />;
    }

    if (!sop || !user) {
        notFound();
    }

    return <RunSOPClient sop={sop} user={user} />;
}