'use client';

import { useState, useEffect } from 'react';
import { OnboardingChecklist } from '@/components/people/onboarding/OnboardingChecklist';
import { employeeApi } from '@/lib/api/employees';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Employee } from '@/types';

interface OnboardingPageProps {
    params: {
        employeeId: string;
    };
}

export default function EmployeeOnboardingPage({ params }: OnboardingPageProps) {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEmployee() {
            try {
                const data = await employeeApi.getById(params.employeeId);
                setEmployee(data);
            } catch (error) {
                console.error('Failed to load employee:', error);
            } finally {
                setLoading(false);
            }
        }
        loadEmployee();
    }, [params.employeeId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-start">
                    <Button variant="outline" asChild>
                        <Link href="/people/employees">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Employees
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold">Employee not found</h2>
                    <p className="text-muted-foreground mt-2">Could not find employee with ID: {params.employeeId}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding {employee.name}</h1>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/strategy/organigram/employees/${params.employeeId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Link>
                </Button>
            </div>

            {/* Onboarding Checklist */}
            <OnboardingChecklist employeeId={params.employeeId} employeeName={employee.name} />
        </div>
    );
}
