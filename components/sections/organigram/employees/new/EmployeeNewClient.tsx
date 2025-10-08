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
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href="/strategy/organigram">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight line-clamp-2">
                            Add New Employee
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            Create a new employee profile for the organization
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                    <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 md:space-y-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-sm font-medium">
                                            Full Name *
                                        </label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter full name"
                                            required
                                            className="text-sm md:text-base"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium">
                                            Email Address *
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="employee@company.com"
                                            required
                                            className="text-sm md:text-base"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="block text-sm font-medium">
                                        Job Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Senior Software Engineer"
                                        required
                                        className="text-sm md:text-base"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organizational Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                    <Building className="h-4 w-4 md:h-5 md:w-5" />
                                    Organizational Details
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Role, department, and reporting structure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 md:space-y-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="role" className="block text-sm font-medium">
                                            Role *
                                        </label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value: any) => handleInputChange('role', value)}
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
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

                                    <div className="space-y-2">
                                        <label htmlFor="department" className="block text-sm font-medium">
                                            Department *
                                        </label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => handleInputChange('department', value)}
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: dept.color }}
                                                            />
                                                            <span className="truncate">{dept.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="startDate" className="block text-sm font-medium">
                                            Start Date *
                                        </label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            required
                                            className="text-sm md:text-base"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="reportsTo" className="block text-sm font-medium">
                                            Reports To (Optional)
                                        </label>
                                        <Input
                                            id="reportsTo"
                                            value={formData.reportsTo}
                                            onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                                            placeholder="Manager's email or ID"
                                            className="text-sm md:text-base"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <Button
                                    type="submit"
                                    className="w-full text-sm md:text-base"
                                    disabled={isLoading}
                                >
                                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                    {isLoading ? 'Creating...' : 'Create Employee'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-sm md:text-base"
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
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-2 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-sm font-medium text-green-800">Active Employee</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    New employees are set to active by default. You can change this later.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Role Guide */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Role Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground pt-0">
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">CEO</strong>
                                    <span>- Overall company leadership</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">CXO</strong>
                                    <span>- Department leadership (CTO, CMO, etc.)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Manager</strong>
                                    <span>- Team leadership and management</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Employee</strong>
                                    <span>- Individual contributor</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Admin</strong>
                                    <span>- System administrator</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}