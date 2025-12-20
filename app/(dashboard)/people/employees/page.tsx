'use client';

import { useEffect, useState } from 'react';
import EmployeesClient from '@/components/people/employees/EmployeesClient';
import { adminApi } from '@/lib/api/admin';
import { Employee, User } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading';

// Mapper to convert User (from adminApi) to Employee (for UI)
const mapUserToEmployee = (user: User): Employee => {
    return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        title: user.position || 'Employee', // fallback
        role: (user.role as any) || 'Employee',
        department: user.department || 'Unassigned',
        avatar: user.avatar,
        startDate: user.createdAt,
        isActive: user.isActive,
        status: user.isActive ? 'ACTIVE' : 'INACTIVE',
        // reportsTo and others might be missing in User but needed in Employee.
        // We initialize them to defaults.
        reportsTo: '',
        team: [],
        entityId: '',
    };
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const users = await adminApi.getUsers();
                const employeesData = users.map(mapUserToEmployee);
                setEmployees(employeesData);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return <EmployeesClient initialEmployees={employees} />;
}
