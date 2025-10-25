'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, User, Entity } from '@/types';
import { ArrowLeft, Save, User as UserIcon, Mail, Briefcase, Building, Globe, MapPin, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeNewClientProps {
    departments: Department[];
    entities?: Entity[]; // Make entities optional
    user: User;
}

export default function EmployeeNewClient({ departments, entities = [], user }: EmployeeNewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        role: 'Employee' as 'CEO' | 'Manager' | 'Employee' | 'Admin' | 'CXO',
        department: '',
        entityId: '',
        startDate: new Date().toISOString().split('T')[0],
        reportsTo: '',
        isActive: true,
        roleLevel: 'Staff' as 'Executive' | 'Manager' | 'Staff'
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-set role level based on role
        if (field === 'role') {
            if (value === 'CEO' || value === 'CXO') {
                setFormData(prev => ({ ...prev, roleLevel: 'Executive' }));
            } else if (value === 'Manager') {
                setFormData(prev => ({ ...prev, roleLevel: 'Manager' }));
            } else {
                setFormData(prev => ({ ...prev, roleLevel: 'Staff' }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate required fields
        if (!formData.name || !formData.email || !formData.title || !formData.department || !formData.entityId) {
            toast.error('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            // API call to create employee

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

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Global': return <Globe className="h-3 w-3" />;
            case 'Regional': return <MapPin className="h-3 w-3" />;
            case 'Country': return <Flag className="h-3 w-3" />;
            default: return <Building className="h-3 w-3" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Global': return '#001F3F';
            case 'Regional': return '#22C55E';
            case 'Country': return '#FACC15';
            default: return '#6B7280';
        }
    };

    // Safe entity filtering with fallback
    const globalEntities = entities?.filter(e => e.level === 'Global') || [];
    const regionalEntities = entities?.filter(e => e.level === 'Regional') || [];
    const countryEntities = entities?.filter(e => e.level === 'Country') || [];

    // Get selected entity for display
    const selectedEntity = entities?.find(e => e.id === formData.entityId);

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
                            Create a new employee profile for the Markpedia OS organization
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
                                            placeholder="employee@markpedia.com"
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
                                        placeholder="e.g., Senior Software Engineer, Regional Director"
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
                                    Role, level, department, and entity assignment
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
                                        <label htmlFor="entityId" className="block text-sm font-medium">
                                            Entity/Level *
                                        </label>
                                        <Select
                                            value={formData.entityId}
                                            onValueChange={(value) => handleInputChange('entityId', value)}
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
                                                <SelectValue placeholder="Select entity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {entities.length === 0 ? (
                                                    <SelectItem value="none" disabled>
                                                        No entities available
                                                    </SelectItem>
                                                ) : (
                                                    <>
                                                        {/* Global Entities */}
                                                        {globalEntities.length > 0 && (
                                                            <>
                                                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 flex items-center gap-1">
                                                                    <Globe className="h-3 w-3" />
                                                                    Global Level
                                                                </div>
                                                                {globalEntities.map(entity => (
                                                                    <SelectItem key={entity.id} value={entity.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                                                style={{ backgroundColor: getLevelColor('Global') }}
                                                                            />
                                                                            <span className="truncate">{entity.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </>
                                                        )}

                                                        {/* Regional Entities */}
                                                        {regionalEntities.length > 0 && (
                                                            <>
                                                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 flex items-center gap-1 mt-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    Regional Level
                                                                </div>
                                                                {regionalEntities.map(entity => (
                                                                    <SelectItem key={entity.id} value={entity.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                                                style={{ backgroundColor: getLevelColor('Regional') }}
                                                                            />
                                                                            <span className="truncate">{entity.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </>
                                                        )}

                                                        {/* Country Entities */}
                                                        {countryEntities.length > 0 && (
                                                            <>
                                                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 flex items-center gap-1 mt-1">
                                                                    <Flag className="h-3 w-3" />
                                                                    Country Level
                                                                </div>
                                                                {countryEntities.map(entity => (
                                                                    <SelectItem key={entity.id} value={entity.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                                                style={{ backgroundColor: getLevelColor('Country') }}
                                                                            />
                                                                            <span className="truncate">{entity.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {entities.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">
                                                No entities available. Please create entities first.
                                            </p>
                                        )}
                                    </div>

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
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reportsTo" className="block text-sm font-medium">
                                        Reports To (Optional)
                                    </label>
                                    <Select
                                        value={formData.reportsTo}
                                        onValueChange={(value) => handleInputChange('reportsTo', value)}
                                    >
                                        <SelectTrigger className="text-sm md:text-base">
                                            <SelectValue placeholder="Select manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Manager (Top Level)</SelectItem>
                                            {entities.map(entity => (
                                                <SelectItem key={entity.id} value={`entity-${entity.id}`} disabled>
                                                    <div className="flex items-center gap-2 opacity-60">
                                                        {getLevelIcon(entity.level)}
                                                        <span>{entity.name} - {entity.headName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select the manager this employee reports to based on organizational hierarchy
                                    </p>
                                </div>

                                {/* Selected Entity Preview */}
                                {selectedEntity && (
                                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            {getLevelIcon(selectedEntity.level)}
                                            <span className="font-medium text-sm">
                                                {selectedEntity.name} ({selectedEntity.level})
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Location: {selectedEntity.country} • Head: {selectedEntity.headName}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Role Level Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg md:text-xl">Role Level</CardTitle>
                                <CardDescription className="text-sm">
                                    Executive, Manager, or Staff level (auto-set based on role)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                                        formData.roleLevel === 'Executive'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                    }`}>
                                        <div className="font-semibold text-sm">Executive</div>
                                        <div className="text-xs text-muted-foreground">CEO, CXO Level</div>
                                    </div>
                                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                                        formData.roleLevel === 'Manager'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200'
                                    }`}>
                                        <div className="font-semibold text-sm">Manager</div>
                                        <div className="text-xs text-muted-foreground">Team Leadership</div>
                                    </div>
                                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                                        formData.roleLevel === 'Staff'
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-200'
                                    }`}>
                                        <div className="font-semibold text-sm">Staff</div>
                                        <div className="text-xs text-muted-foreground">Individual Contributor</div>
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
                                    disabled={isLoading || !formData.name || !formData.email || !formData.title || !formData.department || !formData.entityId}
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
                                    New employees are set to active by default. You can change this later in employee settings.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Level Guide */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Level Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground pt-0">
                                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                                    <Globe className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#001F3F' }} />
                                    <div>
                                        <strong className="text-blue-900">Global Level</strong>
                                        <div className="text-blue-700">Strategic oversight, innovation, partnerships</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                                    <div>
                                        <strong className="text-green-900">Regional Level</strong>
                                        <div className="text-green-700">Regional operations, multi-country coordination</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                                    <Flag className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#FACC15' }} />
                                    <div>
                                        <strong className="text-yellow-900">Country Level</strong>
                                        <div className="text-yellow-700">Local market operations, customer support</div>
                                    </div>
                                </div>
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
                                    <span>- Overall company leadership & vision</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">CXO</strong>
                                    <span>- Department leadership (CTO, CMO, CFO, COO)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Manager</strong>
                                    <span>- Team leadership and people management</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Employee</strong>
                                    <span>- Individual contributor role</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <strong className="flex-shrink-0 w-12">Admin</strong>
                                    <span>- System administration & permissions</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}