'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { departmentService } from '@/services/api';
import { Department, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Building, Mail, Phone, MapPin, Calendar, DollarSign, Edit, UserCheck, UserX, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/loading';
import toast from 'react-hot-toast';
import { sanitizeRichText, normalizeRichTextValue } from '@/lib/rich-text';
import { isAdminLikeRole, isManagerRole } from '@/lib/roles';

export default function DepartmentDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [department, setDepartment] = useState<Department | null>(null);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const isCEO = user?.role === 'CEO';
    const canManage = isAdminLikeRole(user?.role);
    const isManager = isManagerRole(user?.role);
    const isRegularUser = user && !canManage;
    const showAnalytics = canManage || isManager;

    useEffect(() => {
        loadDepartment();
    }, [params.id]);

    const loadDepartment = async () => {
        try {
            setLoading(true);
            const data = await departmentService.get(params.id);
            setDepartment(data);

            // Load employees for the department if manager or admin
            if (data?.name) {
                loadEmployees(data.name);
            }
        } catch (error) {
            console.error('Failed to load department details', error);
            toast.error('Failed to load department details');
            router.push('/work/departments');
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async (departmentName: string) => {
        try {
            setLoadingEmployees(true);
            const { employeeApi } = await import('@/lib/api/employees');
            const data = await employeeApi.getByDepartment(departmentName);
            setEmployees(data);
        } catch (error) {
            console.error('Failed to load department employees', error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    // Derived analytics
    const activeEmployees = employees.filter(e => e.isActive || e.status === 'ACTIVE');
    const inactiveEmployees = employees.filter(e => !e.isActive || e.status === 'INACTIVE');
    const roleBreakdown = employees.reduce((acc, e) => {
        const role = e.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const employmentTypeBreakdown = employees.reduce((acc, e) => {
        const type = e.employmentType || 'Full-time';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

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
                    {canManage && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/work/departments">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
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

            {/* Analytics Summary Cards - visible to managers & admins */}
            {showAnalytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Users className="h-4 w-4" />
                                <span className="text-xs font-medium">Total Employees</span>
                            </div>
                            <p className="text-2xl font-bold">{loadingEmployees ? '...' : employees.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <UserCheck className="h-4 w-4" />
                                <span className="text-xs font-medium">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{loadingEmployees ? '...' : activeEmployees.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <UserX className="h-4 w-4" />
                                <span className="text-xs font-medium">Inactive</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{loadingEmployees ? '...' : inactiveEmployees.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs font-medium">Budget</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {department.budget
                                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(department.budget)
                                    : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                            <div
                                className="text-muted-foreground leading-relaxed rich-text-content [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_b]:font-semibold [&_strong]:font-semibold [&_br]:block"
                                dangerouslySetInnerHTML={{ __html: sanitizeRichText(normalizeRichTextValue(department.description || 'No description provided.')) }}
                            />
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

            {/* Team Members & Breakdown - for managers and admins */}
            {showAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Team Members List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Members
                                {!loadingEmployees && (
                                    <Badge variant="secondary" className="ml-auto">{employees.length}</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>All employees in this department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingEmployees ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="h-10 w-10 rounded-full bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-muted rounded w-1/3" />
                                                <div className="h-3 bg-muted rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : employees.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No employees found in this department</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {(emp.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{emp.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{emp.title || emp.role}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge
                                                    variant={emp.isActive || emp.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {emp.isActive || emp.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {emp.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Breakdown Cards */}
                    <div className="space-y-6">
                        {/* Role Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Role Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingEmployees ? (
                                    <div className="space-y-2 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-6 bg-muted rounded" />
                                        ))}
                                    </div>
                                ) : Object.keys(roleBreakdown).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No data</p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(roleBreakdown)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([role, count]) => (
                                                <div key={role} className="flex items-center justify-between">
                                                    <span className="text-sm">{role}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 bg-primary/20 rounded-full w-20">
                                                            <div
                                                                className="h-2 bg-primary rounded-full transition-all"
                                                                style={{ width: `${(count / employees.length) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Employment Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Employment Type
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingEmployees ? (
                                    <div className="space-y-2 animate-pulse">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-6 bg-muted rounded" />
                                        ))}
                                    </div>
                                ) : Object.keys(employmentTypeBreakdown).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No data</p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(employmentTypeBreakdown)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([type, count]) => (
                                                <div key={type} className="flex items-center justify-between">
                                                    <span className="text-sm">{type}</span>
                                                    <Badge variant="outline">{count}</Badge>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
