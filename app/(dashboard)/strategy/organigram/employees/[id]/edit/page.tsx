'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Employee, Department } from '@/types';
import EmployeeEditClient from '@/components/sections/organigram/employees/[id]/edit/EmployeeEditClient';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { isAdminLikeRole } from '@/lib/roles';
import { departmentService } from '@/services/api';

export default function EmployeeEditPage() {
    const params = useParams<{ id: string }>();
    const employeeId = params?.id;
    const router = useRouter();
    const { user } = useAuthStore();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!employeeId || !user) return;

            if (!isAdminLikeRole(user.role)) {
                router.push('/strategy/organigram');
                return;
            }

            try {
                const { employeeApi } = await import('@/lib/api/employees');
                const [employeeData, departmentData] = await Promise.all([
                    employeeApi.getById(employeeId),
                    departmentService.list(),
                ]);

                setEmployee(employeeData || null);
                setDepartments(departmentData || []);
            } catch (error) {
                console.error('Failed to load employee edit data:', error);
                setEmployee(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId, user, router]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAdminLikeRole(user.role)) {
        return null;
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

    return <EmployeeEditClient employee={employee} departments={departments} user={user} />;
}