'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Department, Entity, User } from '@/types'; // Import User type
import EmployeeEditClient from '@/components/people/employees/EmployeeEditClient';
import { useAuthStore } from '@/store/auth';
import { entityService, departmentService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
    params: {
        id: string;
    };
}

export default function EmployeeEditPage({ params }: PageProps) {
    const { id } = params;
    const { user } = useAuthStore();
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Access control: Only CEO can edit employees?
        // User request didn't strictly specify, but "EmployeeNewPage" restricts to CEO.
        // The user just said "View and Edit Employee". 
        // Typically Admin/CEO can edit.
        // For now I'll check if user exists. 
        // If I strictly follow previous pattern, I might restrict. 
        // But "View" should be allowed for more people maybe?
        // The user asked to "view and edit". 
        // If I block non-CEO, then others can't View.
        // But the comp is "EmployeeEditClient" (form).
        // I'll allow access but maybe restrict save in client? 
        // Or just allow all for now as I'm "Antigravity" :). 
        // The prompt "View and Edit" implies functionality.
        // I will NOT restrict strictly to CEO yet unless asked, to avoid blocking "View".
        // Though the component is heavily "Edit".
        // I will just fetch data.

        async function fetchData() {
            try {
                const [departmentsData, entitiesData] = await Promise.all([
                    departmentService.list(),
                    entityService.getEntities() // Or just empty if failed
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
        } else {
            // Let useAuthStore handle loading or redirect if not logged in
            // Usually useAuthStore initial state might result in loading effectively
            // But if user is null after hydration, we might want to redirect.
            // For now just wait.
            setLoading(false); // Stop loading if no user, so we can show "Access Denied" or login
        }
    }, [user]);

    if (!user) {
        // Show loading or redirect
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-muted-foreground">Please log in to view this page.</p>
                <Button asChild><Link href="/login">Login</Link></Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <EmployeeEditClient
            employeeId={id}
            departments={departments}
            entities={entities}
            user={user} // Now passing the user from store
        />
    );
}
