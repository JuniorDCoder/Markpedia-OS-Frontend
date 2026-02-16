'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Employee, User } from '@/types';
import { ArrowLeft, Edit, Mail, Calendar, Building, User as UserIcon, Trash2, AlertCircle, ShieldAlert, Phone, Globe, Languages, MapPin, BadgeCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { isAdminLikeRole } from '@/lib/roles';

interface EmployeeViewClientProps {
    employee: Employee;
    user: User;
}

export default function EmployeeViewClient({ employee, user }: EmployeeViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const canEdit = isAdminLikeRole(currentUser?.role);

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

    const getAvatarUrl = () => {
        if (!employee.avatar) return undefined;
        if (employee.avatar.startsWith('http')) return employee.avatar;
        return employee.avatar.startsWith('/') ? employee.avatar : `/${employee.avatar}`;
    };

    const openDeleteDialog = () => {
        setConfirmText('');
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const expected = `DELETE ${employee.name}`;
        if (confirmText !== expected) {
            toast.error(`Please type "${expected}" to confirm deletion`);
            return;
        }

        setIsDeleting(true);
        try {
            const { employeeApi } = await import('@/lib/api/employees');
            await employeeApi.delete(employee.id);
            toast.success('Employee deleted successfully');
            setDeleteOpen(false);
            router.push('/strategy/organigram');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to delete employee:', error);
            toast.error(error?.message || 'Failed to delete employee');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Employee
                        </DialogTitle>
                        <DialogDescription>
                            This action is <strong>permanent</strong> and cannot be undone. All data associated with this employee will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-red-900">{employee.name}</p>
                                    <p className="text-sm text-red-700">{employee.title} &middot; {employee.department}</p>
                                    <p className="text-xs text-red-600 mt-1">{employee.email}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs text-red-600">DELETE {employee.name}</code> to confirm
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={`DELETE ${employee.name}`}
                                className="font-mono text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting || confirmText !== `DELETE ${employee.name}`}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? 'Deleting...' : 'Delete Employee'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xl">
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt={employee.name} className="h-full w-full object-cover" />
                                    ) : (
                                        employee.name.split(' ').map(n => n[0]).join('')
                                    )}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-3 rounded-lg border bg-muted/20">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Phone className="h-4 w-4" />Mobile</div>
                                    <p className="font-medium">{employee.mobile || 'Not provided'}</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/20">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Globe className="h-4 w-4" />Country</div>
                                    <p className="font-medium">{employee.country || 'Not provided'}</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/20">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Languages className="h-4 w-4" />Language</div>
                                    <p className="font-medium">{employee.language || 'English'}</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/20">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><BadgeCheck className="h-4 w-4" />Employment</div>
                                    <p className="font-medium">{employee.employmentType || 'Full-time'}</p>
                                </div>
                            </div>

                            {(employee.about || employee.address) && (
                                <div className="space-y-3 pt-2">
                                    {employee.about && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">About</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{employee.about}</p>
                                        </div>
                                    )}
                                    {employee.address && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2"><MapPin className="h-4 w-4" />Address</h4>
                                            <p className="text-sm text-muted-foreground">{employee.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                <Link href={`/people/onboarding/${employee.id}`}>
                                    View Onboarding
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
                                    className="w-full justify-start gap-2"
                                    onClick={openDeleteDialog}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Employee
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
                                <span className="font-mono">{employee.employeeId || employee.id}</span>
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

                    {(employee.skills?.length || employee.hourlyRate || employee.businessAddress) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {employee.skills && employee.skills.length > 0 && (
                                    <div>
                                        <p className="text-muted-foreground mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {employee.skills.map((skill) => (
                                                <Badge key={skill} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {employee.hourlyRate ? (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hourly Rate:</span>
                                        <span className="font-medium">XAF {employee.hourlyRate}</span>
                                    </div>
                                ) : null}
                                {employee.businessAddress ? (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Business Address</p>
                                        <p className="font-medium">{employee.businessAddress}</p>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}