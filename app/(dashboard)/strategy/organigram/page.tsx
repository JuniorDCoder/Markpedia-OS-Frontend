'use client';

import { useEffect, useState } from 'react';
import { Employee, OrganigramSnapshot, Department, Entity, User } from '@/types';
import OrganigramClient from "@/components/sections/organigram/OrganigramClient";
import { employeeService, entityService, departmentService } from '@/services/api';
import { snapshotApi } from '@/lib/api/snapshots';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/loading';

export default function OrganigramPage() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [snapshots, setSnapshots] = useState<OrganigramSnapshot[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [employeesData, entitiesData, snapshotsData, departmentsData] = await Promise.all([
                    employeeService.getEmployees(),
                    entityService.getEntities(),
                    snapshotApi.getAll(),
                    departmentService.list()
                ]);

                setEmployees(employeesData);
                setEntities(entitiesData);
                setSnapshots(snapshotsData);
                setDepartments(departmentsData);
            } catch (err) {
                console.error('Error fetching organigram data:', err);
                setError('Failed to load organigram data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }


    return (
        <OrganigramClient
            employees={employees}
            snapshots={snapshots}
            departments={departments}
            entities={entities}
            user={user}
        />
    );
}