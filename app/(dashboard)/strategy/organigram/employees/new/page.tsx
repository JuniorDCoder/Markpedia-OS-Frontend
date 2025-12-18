'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Department, Entity } from '@/types';
import EmployeeNewClient from "@/components/sections/organigram/employees/new/EmployeeNewClient";
import { useAuthStore } from '@/store/auth';
import { entityService, departmentService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading';

export default function EmployeeNewPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only CEOs can create employees
        if (user && user.role !== 'CEO') {
            router.push('/strategy/organigram');
            return;
        }

        async function fetchData() {
            try {
                const [departmentsData, entitiesData] = await Promise.all([
                    departmentService.list(),
                    entityService.getEntities()
                ]);

                setDepartments(departmentsData);
                setEntities(entitiesData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user, router]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Double-check: Only CEO can access
    if (user.role !== 'CEO') {
        return null; // Will redirect via useEffect
    }

    return (
        <EmployeeNewClient
            departments={departments}
            entities={entities}
            user={user}
        />
    );
}