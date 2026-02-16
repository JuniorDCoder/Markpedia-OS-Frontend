'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Employee } from '@/types';
import EmployeeViewClient from '@/components/sections/organigram/employees/[id]/EmployeeViewClient';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';

export default function EmployeeViewPage() {
    const params = useParams<{ id: string }>();
    const employeeId = params?.id;
    const { user } = useAuthStore();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!employeeId) return;
            try {
                const { employeeApi } = await import('@/lib/api/employees');
                const data = await employeeApi.getById(employeeId);
                setEmployee(data || null);
            } catch (error) {
                console.error('Failed to load employee:', error);
                setEmployee(null);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [employeeId]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-muted-foreground">Employee not found.</p>
                    <Button asChild variant="outline">
                        <Link href="/strategy/organigram">Back to Organigram</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <EmployeeViewClient employee={employee} user={user} />;
}