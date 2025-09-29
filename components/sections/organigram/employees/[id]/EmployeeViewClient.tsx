'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employee, User } from '@/types';
import { ArrowLeft, Edit, Mail, Calendar, Building, User as UserIcon, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface EmployeeViewClientProps {
    employee: Employee;
    user: User;
}

export default function EmployeeViewClient({ employee, user }: EmployeeViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);

    const canEdit = currentUser?.role === 'CEO' || currentUser?.role === 'Admin' ||
        currentUser?.role === 'CXO';

    const canDelete = currentUser?.role === 'CEO' || currentUser?.role === 'Admin';

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'CEO': return 'bg-purple-100 text-purple-800';
            case 'CXO': return 'bg-blue-100 text-blue-800';
            case 'Manager': return 'bg-green-100 text-green-800';
            case 'Admin': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await fetch(`/api/organigram/employees/${employee.id}`, { method: 'DELETE' });
            window.location.href = '/strategy/organigram';
        } catch (error) {
            console.error('Failed to delete employee:', error);
            alert('Failed to delete employee');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/strategy/organigram">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
                        <p className="text-muted-foreground mt-1">Employee Profile</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Button asChild>
                            <Link href={`/strategy/organigram/employees/${employee.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Personal and professional details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                                    <p className="text-lg text-muted-foreground">{employee.title}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge className={getRoleColor(employee.role)}>
                                            {employee.role}
                                        </Badge>
                                        <Badge className={getStatusColor(employee.isActive)}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </div>
                                    <p className="font-medium">{employee.email}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        Department
                                    </div>
                                    <p className="font-medium">{employee.department}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Start Date
                                    </div>
                                    <p className="font-medium">
                                        {new Date(employee.startDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UserIcon className="h-4 w-4" />
                                        Tenure
                                    </div>
                                    <p className="font-medium">
                                        {Math.floor((new Date().getTime() - new Date(employee.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizational Context */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Organizational Context</CardTitle>
                            <CardDescription>Team structure and relationships</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Reporting Structure</h4>
                                    {employee.reportsTo ? (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm">Reports to: {employee.reportsTo}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No direct manager specified</p>
                                    )}
                                </div>

                                {employee.team && employee.team.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Team Members</h4>
                                        <div className="space-y-2">
                                            {employee.team.map(memberId => (
                                                <div key={memberId} className="p-2 bg-muted rounded text-sm">
                                                    Team Member: {memberId}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/strategy/organigram?highlight=${employee.id}`}>
                                    View in Organigram
                                </Link>
                            </Button>

                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`mailto:${employee.email}`}>
                                    Send Email
                                </Link>
                            </Button>

                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isDeleting ? 'Deleting...' : 'Delete Employee'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Employee ID:</span>
                                <span className="font-mono">{employee.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated:</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Profile Status:</span>
                                <span className={employee.isActive ? 'text-green-600' : 'text-gray-600'}>
                  {employee.isActive ? 'Complete' : 'Incomplete'}
                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}