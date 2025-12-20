'use client';

import { useEffect, useState } from 'react';
import EmployeesClient from '@/components/people/employees/EmployeesClient';
import { employeeApi } from '@/lib/api/employees';
import { Employee } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const employeesData = await employeeApi.getAll();
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
