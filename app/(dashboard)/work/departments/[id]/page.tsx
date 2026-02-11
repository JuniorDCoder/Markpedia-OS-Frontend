'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { departmentService } from '@/services/api';
import { Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Building, Mail, Phone, MapPin, Calendar, DollarSign, Edit } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/loading';
import toast from 'react-hot-toast';

export default function DepartmentDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [department, setDepartment] = useState<Department | null>(null);
    const [loading, setLoading] = useState(true);

    const isCEO = user?.role === 'CEO';

    useEffect(() => {
        loadDepartment();
    }, [params.id]);

    const loadDepartment = async () => {
        try {
            setLoading(true);
            const data = await departmentService.get(params.id);
            setDepartment(data);
        } catch (error) {
            console.error('Failed to load department details', error);
            toast.error('Failed to load department details');
            router.push('/work/departments');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    if (!department) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-2">Department Not Found</h2>
                <Button asChild>
                    <Link href="/work/departments">Back to Departments</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/work/departments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {department.name}
                            {department.status && (
                                <Badge variant={department.status === 'Active' ? 'default' : 'secondary'}>
                                    {department.status}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {department.description}
                        </p>
                    </div>
                </div>
                {isCEO && (
                    <Button asChild>
                        <Link href={`/work/departments/${department.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Department
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center text-muted-foreground mb-1">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Head of Department</span>
                                </div>
                                <p className="font-semibold text-lg">{department.headName || department.manager_name || 'Vacant'}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center text-muted-foreground mb-1">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Team Size</span>
                                </div>
                                <p className="font-semibold text-lg">{department.member_count || 0} Members</p>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center text-muted-foreground mb-1">
                                    <Building className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Parent Department</span>
                                </div>
                                <p className="font-semibold text-lg">{department.parent_department || 'None'}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center text-muted-foreground mb-1">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Annual Budget</span>
                                </div>
                                <p className="font-semibold text-lg">
                                    {department.budget
                                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(department.budget)
                                        : 'Not set'
                                    }
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {department.description || 'No description provided.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Side Info Card */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact & Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Contact Email */}
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        {department.contact_email || 'Not available'}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Phone */}
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">
                                        {department.contact_phone || 'Not available'}
                                    </p>
                                </div>
                            </div>

                            {/* Locations */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Locations</p>
                                    {department.locations && department.locations.length > 0 ? (
                                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                                            {department.locations.map((loc, idx) => (
                                                <li key={idx}>{loc}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Remote / Head Office</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                </div>
            </div>
        </div>
    );
}
