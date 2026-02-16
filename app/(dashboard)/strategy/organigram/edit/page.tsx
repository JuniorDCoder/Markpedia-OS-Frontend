'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Employee, OrganigramSnapshot, Department } from '@/types';
import EditOrganigramClient from "@/components/sections/organigram/EditOrganigramClient";
import { employeeApi } from '@/lib/api/employees';
import { departmentsApi } from '@/lib/api/departments';
import { snapshotApi } from '@/lib/api/snapshots';
import { Loader2 } from 'lucide-react';
import { isAdminLikeRole } from '@/lib/roles';

export default function EditOrganigramPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [snapshots, setSnapshots] = useState<OrganigramSnapshot[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Check auth
                const storedUser = localStorage.getItem('auth_user');
                if (!storedUser) {
                    router.push('/auth/login');
                    return;
                }
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Check permissions
                if (!isAdminLikeRole(parsedUser.role)) {
                    router.push('/strategy/organigram');
                    return;
                }

                // Fetch real data
                const [emps, snaps, depts] = await Promise.all([
                    employeeApi.getAll({ limit: 1000 }), // Get all employees
                    snapshotApi.getAll(),
                    departmentsApi.getAll({ limit: 100 })
                ]);

                // Map backend departments to frontend Department interface if needed
                // BackendDepartment has { name, color? ... }
                // Frontend Department: { id, name, color, description, memberCount }
                const mappedDepartments: Department[] = depts.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    color: d.color || '#6B7280', // Default color if missing
                    description: d.description || '',
                    memberCount: d.employee_count || 0
                }));

                setEmployees(emps);
                setSnapshots(snaps);
                setDepartments(mappedDepartments);
            } catch (error) {
                console.error("Failed to load organigram data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <EditOrganigramClient
            employees={employees}
            snapshots={snapshots}
            departments={departments}
            user={user}
        />
    );
}