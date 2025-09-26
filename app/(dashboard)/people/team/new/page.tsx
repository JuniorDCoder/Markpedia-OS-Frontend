'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { teamService } from '@/lib/api/teams';
import { Department, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, ArrowLeft, Loader2, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentId: string;
    roleId: string;
    hireDate: string;
    salary: number;
    status: 'Active' | 'Inactive' | 'On Leave';
}

export default function NewTeamMemberPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        roleId: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        status: 'Active',
    });

    useEffect(() => {
        loadSelectData();
    }, []);

    const loadSelectData = async () => {
        try {
            const [depts, rolesData] = await Promise.all([
                teamService.getDepartments(),
                teamService.getRoles()
            ]);
            setDepartments(depts);
            setRoles(rolesData);
        } catch (error) {
            toast.error('Failed to load form data');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.departmentId || !formData.roleId) {
            toast.error('Please select both department and role');
            return;
        }

        try {
            setSaving(true);
            await teamService.createTeamMember(formData);
            toast.success('Team member created successfully');
            router.push('/people/team');
        } catch (error) {
            toast.error('Failed to create team member');
        } finally {
            setSaving(false);
        }
    };

    const canManage = user?.role === 'CEO' || user?.role === 'Manager';

    if (!canManage) {
        return (
            <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-4">
                    You don't have permission to create team members.
                </p>
                <Button asChild>
                    <Link href="/people/team">
                        Back to Team
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/team">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Team
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <UserPlus className="h-8 w-8 mr-3" />
                        Add Team Member
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create a new team member profile
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Team Member Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new team member
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Personal Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="departmentId">Department *</Label>
                                <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roleId">Role *</Label>
                                <Select value={formData.roleId} onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hireDate">Hire Date *</Label>
                                <Input
                                    id="hireDate"
                                    type="date"
                                    value={formData.hireDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Annual Salary ($) *</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Employment Status</Label>
                            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/people/team">
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                Create Team Member
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}