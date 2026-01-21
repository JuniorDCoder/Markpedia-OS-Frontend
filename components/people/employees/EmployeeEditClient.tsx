'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Department, User, Entity } from '@/types';
import { ArrowLeft, Save, Upload, User as UserIcon, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading';

interface EmployeeEditClientProps {
    employeeId: string;
    departments: Department[];
    entities?: Entity[];
    user?: User; // Current logged in user
}

export default function EmployeeEditClient({ employeeId, departments, entities = [], user }: EmployeeEditClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const canEdit = user && ['CEO', 'HR', 'Admin', 'CXO'].includes(user.role);

    const [formData, setFormData] = useState({
        // Account Details
        employeeId: '',
        salutation: '',
        name: '',
        email: '',
        dateOfBirth: '',
        designation: '',
        department: '',
        country: '',
        mobile: '',
        gender: '',
        joiningDate: '',
        reportsTo: '',
        language: 'English',
        role: 'Employee' as 'CEO' | 'Manager' | 'Employee' | 'Admin' | 'CXO',

        // Address/About
        address: '',
        about: '',

        // Other Details
        loginAllowed: true,
        emailNotifications: true,
        hourlyRate: '',
        slackMemberId: '',
        skills: '',

        // Dates/Status
        probationEndDate: '',
        noticePeriodStartDate: '',
        noticePeriodEndDate: '',
        employmentType: 'Full-time',
        maritalStatus: 'Single',
        businessAddress: '',

        entityId: '',
        image: '',
    });

    useEffect(() => {
        async function fetchEmployee() {
            try {
                const { employeeApi } = await import('@/lib/api/employees');
                const emp = await employeeApi.getById(employeeId);

                if (!emp) {
                    toast.error('Employee not found');
                    router.push('/people/employees');
                    return;
                }

                // Helper to format date for input (yyyy-MM-dd)
                const formatDate = (dateString?: string) => {
                    if (!dateString) return '';
                    return dateString.split('T')[0];
                };

                // Map Employee (public) response to form data
                setFormData({
                    employeeId: emp.id,
                    salutation: emp.salutation || '',
                    name: emp.name,
                    email: emp.email,
                    dateOfBirth: formatDate(emp.dateOfBirth),
                    designation: emp.title || '',
                    department: emp.department || '',
                    country: emp.country || '',
                    mobile: emp.mobile || '',
                    gender: emp.gender || '',
                    joiningDate: formatDate(emp.joiningDate || emp.startDate),
                    reportsTo: emp.reportsTo || '',
                    language: emp.language || 'English',
                    role: (emp.role as any) || 'Employee',

                    address: emp.address || '',
                    about: emp.about || '',

                    loginAllowed: emp.isActive,
                    emailNotifications: emp.emailNotifications !== false,
                    hourlyRate: emp.hourlyRate ? String(emp.hourlyRate) : '',
                    slackMemberId: emp.slackMemberId || '',
                    skills: typeof emp.skills === 'string' ? emp.skills : (Array.isArray(emp.skills) ? emp.skills.join(', ') : ''),

                    probationEndDate: formatDate(emp.probationEndDate),
                    noticePeriodStartDate: formatDate(emp.noticePeriodStartDate),
                    noticePeriodEndDate: formatDate(emp.noticePeriodEndDate),
                    employmentType: emp.employmentType || 'Full-time',
                    maritalStatus: emp.maritalStatus || 'Single',
                    businessAddress: emp.businessAddress || '',

                    entityId: emp.entityId || '',
                    image: emp.avatar || '',
                });

                // Store original role for permission checks
                setOriginalRole((emp.role as any) || 'Employee');
            } catch (error) {
                console.error('Error fetching employee:', error);
                toast.error('Failed to load employee details');
            } finally {
                setIsFetching(false);
            }
        }

        fetchEmployee();
    }, [employeeId]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [originalRole, setOriginalRole] = useState('');
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    // Check if current user can update the target user's role
    const canUpdateRole = () => {
        if (!user) return false;

        // CEO can update anyone's role
        if (user.role === 'CEO') return true;

        // Top admins (Admin, CXO, HR, CFO, CTO, etc.) can only update non-top-admin roles
        const topAdminRoles = ['Admin', 'CEO', 'CFO', 'CTO', 'COO', 'CIO', 'CMO', 'HR'];
        const isCurrentUserTopAdmin = topAdminRoles.includes(user.role);
        const isTargetUserTopAdmin = topAdminRoles.includes(originalRole);

        if (isCurrentUserTopAdmin && !isTargetUserTopAdmin) {
            return true;
        }

        return false;
    };

    const handleRoleUpdate = async () => {
        if (!canUpdateRole()) {
            toast.error('You do not have permission to update this user\'s role');
            return;
        }

        if (formData.role === originalRole) {
            toast.error('Role has not changed');
            return;
        }

        setIsUpdatingRole(true);
        try {
            const { adminApi } = await import('@/lib/api/admin');
            await adminApi.updateUserRole(employeeId, formData.role);
            setOriginalRole(formData.role);
            toast.success('Role updated successfully');
        } catch (error: any) {
            console.error('Error updating role:', error);
            if (error?.message?.includes('403')) {
                toast.error('You do not have permission to update this role');
            } else {
                toast.error('Failed to update role');
            }
            // Revert to original role
            setFormData(prev => ({ ...prev, role: originalRole as any }));
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;
        setIsLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.department) {
            toast.error('Please fill in all required fields marked with *');
            setIsLoading(false);
            return;
        }

        try {
            const { employeeApi } = await import('@/lib/api/employees');

            await employeeApi.update(employeeId, {
                email: formData.email,
                name: formData.name, // Pass full name, let API handle split
                role: formData.role,
                department: formData.department,
                title: formData.designation,
                isActive: formData.loginAllowed,

                salutation: formData.salutation,
                dateOfBirth: formData.dateOfBirth,
                mobile: formData.mobile,
                country: formData.country,
                gender: formData.gender,
                startDate: formData.joiningDate, // key mismatch fix: joiningDate -> startDate
                language: formData.language,

                address: formData.address,
                about: formData.about,
                businessAddress: formData.businessAddress,

                loginAllowed: formData.loginAllowed,
                emailNotifications: formData.emailNotifications,
                hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
                slackMemberId: formData.slackMemberId,
                skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [],

                probationEndDate: formData.probationEndDate,
                noticePeriodStartDate: formData.noticePeriodStartDate,
                noticePeriodEndDate: formData.noticePeriodEndDate,
                employmentType: formData.employmentType,
                maritalStatus: formData.maritalStatus,

                entityId: formData.entityId,
            });

            toast.success('Employee updated successfully');
            router.push('/people/employees');
            router.refresh();
        } catch (error) {
            console.error('Error updating employee:', error);
            toast.error('Failed to update employee');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;

        setIsLoading(true);
        try {
            const { employeeApi } = await import('@/lib/api/employees');
            await employeeApi.delete(employeeId);
            toast.success('Employee deleted successfully');
            router.push('/people/employees');
            router.refresh();
        } catch (error) {
            console.error('Error deleting employee:', error);
            toast.error('Failed to delete employee');
            setIsLoading(false);
        }
    };

    const [isEditing, setIsEditing] = useState(false);

    // Cancel edit: revert to view mode
    const handleCancelEdit = () => setIsEditing(false);

    if (isFetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const renderViewMode = () => (
        <div className="space-y-6">
            {/* Account Details View */}
            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 flex justify-center md:justify-start">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-primary/10">
                            {formData.image ? (
                                <img src={formData.image} alt={formData.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-primary font-bold text-2xl uppercase">
                                    {formData.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                            <p className="font-medium">{formData.employeeId || '--'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="font-medium">
                                {formData.salutation} {formData.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="font-medium break-all">{formData.email}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{formData.dateOfBirth || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Designation</p>
                        <p className="font-medium">{formData.designation || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                        <p className="font-medium">{formData.department}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.role === 'CEO' || formData.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {formData.role}
                        </span>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                        <p className="font-medium">{formData.mobile || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p className="font-medium">{formData.gender || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Joining Date</p>
                        <p className="font-medium">{formData.joiningDate || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Reporting To</p>
                        <p className="font-medium">{formData.reportsTo === 'none' ? 'None' : formData.reportsTo || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.loginAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formData.loginAllowed ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Entity</p>
                        <p className="font-medium">{entities.find(e => e.id === formData.entityId)?.name || 'Default'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Other Details View */}
            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold">Address & Bio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 gap-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="font-medium whitespace-pre-wrap">{formData.address || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">About</p>
                        <p className="font-medium whitespace-pre-wrap">{formData.about || '--'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Skills & Settings View */}
            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold">Skills & Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {formData.skills ? formData.skills.split(',').map((s, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {s.trim()}
                                </span>
                            )) : '--'}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Slack Member ID</p>
                        <p className="font-medium font-mono text-xs bg-muted p-1 rounded inline-block">{formData.slackMemberId || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                        <p className="font-medium">{formData.hourlyRate ? `$${formData.hourlyRate}/hr` : '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Notifications</p>
                        <p className="font-medium">{formData.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Login Access</p>
                        <p className="font-medium">{formData.loginAllowed ? 'Allowed' : 'Revoked'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Employment Details View */}
            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold">Employment Terms</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-medium">{formData.employmentType}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                        <p className="font-medium">{formData.maritalStatus}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Probation Ends</p>
                        <p className="font-medium">{formData.probationEndDate || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Notice Starts</p>
                        <p className="font-medium">{formData.noticePeriodStartDate || '--'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {/* Dynamic Title based on mode */}
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? 'Edit Profile' : 'Employee Profile'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isEditing
                            ? 'Update employee details below.'
                            : 'View comprehensive employee details.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* View Mode Buttons */}
                    {!isEditing && canEdit && (
                        <>
                            <Button variant="destructive" size="sm" onClick={handleDelete} title="Delete Employee">
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                <UserIcon className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </>
                    )}

                    {/* Common Cancel/Back */}
                    {!isEditing && (
                        <Button variant="outline" asChild>
                            <Link href="/people/employees">Back to List</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Switch */}
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Reuse existing fieldset but remove disabled={!canEdit} since we only show this if editing */}
                    <fieldset className="space-y-6">
                        {/* ... Existing Card Structure for Editing ... */}
                        {/* To avoid huge repetition in this prompt replacement, I will assume I can keep the existing JSX for form 
                             but I need to wrap it. However, since I am replacing the WHOLE return, I must provide the form code again.
                             I will copy the form code from the previous file view to ensure exactness.
                             I will define 'renderEditForm' or just inline it.
                             I will inline it to be safe.
                         */}
                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Row 1 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Employee ID</label>
                                    <Input value={formData.employeeId} disabled className="bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Salutation</label>
                                    <Select value={formData.salutation} onValueChange={(v) => handleInputChange('salutation', v)}>
                                        <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mr.">Mr.</SelectItem>
                                            <SelectItem value="Mrs.">Mrs.</SelectItem>
                                            <SelectItem value="Ms.">Ms.</SelectItem>
                                            <SelectItem value="Dr.">Dr.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Employee Name <span className="text-red-500">*</span></label>
                                    <Input
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Row 2 */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Employee Email <span className="text-red-500">*</span></label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. johndoe@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2 row-span-2">
                                    <label className="text-sm font-medium">Profile Picture</label>
                                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground transition-colors h-full cursor-pointer hover:bg-gray-50">
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span className="text-sm">Choose a file</span>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Designation <span className="text-red-500">*</span></label>
                                    <Input
                                        placeholder="e.g. Software Engineer"
                                        value={formData.designation}
                                        onChange={(e) => handleInputChange('designation', e.target.value)}
                                    />
                                </div>

                                {/* Row 4 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
                                    <Select value={formData.department} onValueChange={(v) => handleInputChange('department', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Country</label>
                                    <Input
                                        placeholder="e.g. United States"
                                        value={formData.country}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                    />
                                </div>

                                {/* Row 5 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile</label>
                                    <Input
                                        placeholder="+1 234 567 890"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 6 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Joining Date</label>
                                    <Input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Reporting To</label>
                                    <Select value={formData.reportsTo} onValueChange={(v) => handleInputChange('reportsTo', v)}>
                                        <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="manager">Manager (Placeholder)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 7 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Language</label>
                                    <Select value={formData.language} onValueChange={(v) => handleInputChange('language', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Spanish">Spanish</SelectItem>
                                            <SelectItem value="French">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">User Role</label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.role}
                                            onValueChange={(v: any) => handleInputChange('role', v)}
                                            disabled={!canUpdateRole()}
                                        >
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Employee">Employee</SelectItem>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="HR">HR</SelectItem>
                                                <SelectItem value="CFO">CFO</SelectItem>
                                                <SelectItem value="CTO">CTO</SelectItem>
                                                <SelectItem value="COO">COO</SelectItem>
                                                <SelectItem value="CIO">CIO</SelectItem>
                                                <SelectItem value="CMO">CMO</SelectItem>
                                                <SelectItem value="CEO">CEO</SelectItem>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {canUpdateRole() && formData.role !== originalRole && (
                                            <Button
                                                type="button"
                                                onClick={handleRoleUpdate}
                                                disabled={isUpdatingRole}
                                                size="sm"
                                                className="whitespace-nowrap"
                                            >
                                                {isUpdatingRole ? 'Updating...' : 'Update Role'}
                                            </Button>
                                        )}
                                    </div>
                                    {!canUpdateRole() && (
                                        <p className="text-xs text-muted-foreground">
                                            {user?.role === 'CEO'
                                                ? 'Only CEO can update top admin roles'
                                                : 'You can only update non-admin roles'}
                                        </p>
                                    )}
                                    {formData.role !== originalRole && canUpdateRole() && (
                                        <p className="text-xs text-amber-600">
                                            Role has been changed. Click "Update Role" to save this change.
                                        </p>
                                    )}
                                </div>

                                {/* Hidden Entity ID for legacy */}
                                {entities.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Entity</label>
                                        <Select value={formData.entityId} onValueChange={(v) => handleInputChange('entityId', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Entity" /></SelectTrigger>
                                            <SelectContent>
                                                {entities.map(e => (
                                                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.level})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-base font-semibold">Other Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Textarea
                                        placeholder="e.g. 132, My Street, Kingston, New York 12401"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">About</label>
                                    <Textarea
                                        placeholder="Write something about the employee..."
                                        className="min-h-[100px]"
                                        value={formData.about}
                                        onChange={(e) => handleInputChange('about', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-base font-semibold">Settings & Skills</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Login Allowed?</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="login-yes"
                                                checked={formData.loginAllowed}
                                                onCheckedChange={() => handleInputChange('loginAllowed', true)}
                                            />
                                            <label htmlFor="login-yes" className="text-sm">Yes</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="login-no"
                                                checked={!formData.loginAllowed}
                                                onCheckedChange={() => handleInputChange('loginAllowed', false)}
                                            />
                                            <label htmlFor="login-no" className="text-sm">No</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Receive email notifications?</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="notify-yes"
                                                checked={formData.emailNotifications}
                                                onCheckedChange={() => handleInputChange('emailNotifications', true)}
                                            />
                                            <label htmlFor="notify-yes" className="text-sm">Yes</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="notify-no"
                                                checked={!formData.emailNotifications}
                                                onCheckedChange={() => handleInputChange('emailNotifications', false)}
                                            />
                                            <label htmlFor="notify-no" className="text-sm">No</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hourly Rate</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                            USD
                                        </span>
                                        <Input
                                            className="rounded-l-none"
                                            type="number"
                                            value={formData.hourlyRate}
                                            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slack Member ID</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                            @
                                        </span>
                                        <Input
                                            className="rounded-l-none"
                                            value={formData.slackMemberId}
                                            onChange={(e) => handleInputChange('slackMemberId', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-4 space-y-2">
                                    <label className="text-sm font-medium">Skills</label>
                                    <Input
                                        placeholder="e.g. communication, ReactJS, Project Management"
                                        value={formData.skills}
                                        onChange={(e) => handleInputChange('skills', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-base font-semibold">Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Probation End Date</label>
                                    <Input
                                        type="date"
                                        value={formData.probationEndDate}
                                        onChange={(e) => handleInputChange('probationEndDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notice Period Start Date</label>
                                    <Input
                                        type="date"
                                        value={formData.noticePeriodStartDate}
                                        onChange={(e) => handleInputChange('noticePeriodStartDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notice Period End Date</label>
                                    <Input
                                        type="date"
                                        value={formData.noticePeriodEndDate}
                                        onChange={(e) => handleInputChange('noticePeriodEndDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Employment Type</label>
                                    <Select value={formData.employmentType} onValueChange={(v) => handleInputChange('employmentType', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Marital Status</label>
                                    <Select value={formData.maritalStatus} onValueChange={(v) => handleInputChange('maritalStatus', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Business Address</label>
                                    <Input
                                        value={formData.businessAddress}
                                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                        placeholder="e.g. Head Office"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </fieldset>

                    <div className="flex items-center gap-4 pt-4">
                        <Button type="submit" size="lg" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white min-w-[150px]">
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="ghost" size="lg" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                renderViewMode()
            )}
        </div>
    );
}