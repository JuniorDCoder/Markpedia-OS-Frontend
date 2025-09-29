'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, User } from '@/types';
import { ArrowLeft, Save, User as UserIcon, Mail, Briefcase, Building } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeNewClientProps {
    departments: Department[];
    user: User;
}

export default function EmployeeNewClient({ departments, user }: EmployeeNewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        role: 'Employee' as 'CEO' | 'Manager' | 'Employee' | 'Admin' | 'CXO',
        department: '',
        startDate: new Date().toISOString().split('T')[0],
        reportsTo: '',
        isActive: true
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/organigram/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create employee');
            }

            const newEmployee = await response.json();
            toast.success('Employee created successfully');
            router.push('/strategy/organigram');
            router.refresh();
        } catch (error) {
            console.error('Error creating employee:', error);
            toast.error('Failed to create employee');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleOptions = () => {
        const baseOptions = [
            { value: 'Employee', label: 'Employee' },
            { value: 'Manager', label: 'Manager' }
        ];

        if (user.role === 'CEO' || user.role === 'Admin') {
            baseOptions.unshift(
                { value: 'CEO', label: 'CEO' },
                { value: 'CXO', label: 'CXO' },
                { value: 'Admin', label: 'Admin' }
            );
        }

        return baseOptions;
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
                        <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
                        <p className="text-muted-foreground mt-1">
                            Create a new employee profile for the organization
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                                            Full Name *
                                        </label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                                            Email Address *
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="employee@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                                        Job Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Senior Software Engineer"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organizational Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Organizational Details
                                </CardTitle>
                                <CardDescription>
                                    Role, department, and reporting structure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium mb-2">
                                            Role *
                                        </label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value: any) => handleInputChange('role', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getRoleOptions().map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium mb-2">
                                            Department *
                                        </label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => handleInputChange('department', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: dept.color }}
                                                            />
                                                            {dept.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                                            Start Date *
                                        </label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="reportsTo" className="block text-sm font-medium mb-2">
                                            Reports To (Optional)
                                        </label>
                                        <Input
                                            id="reportsTo"
                                            value={formData.reportsTo}
                                            onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                                            placeholder="Manager's email or ID"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating...' : 'Create Employee'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/strategy/organigram">
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Active Employee</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    New employees are set to active by default. You can change this later.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Role Guide */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div>
                                    <strong>CEO</strong> - Overall company leadership
                                </div>
                                <div>
                                    <strong>CXO</strong> - Department leadership (CTO, CMO, etc.)
                                </div>
                                <div>
                                    <strong>Manager</strong> - Team leadership and management
                                </div>
                                <div>
                                    <strong>Employee</strong> - Individual contributor
                                </div>
                                <div>
                                    <strong>Admin</strong> - System administrator
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}