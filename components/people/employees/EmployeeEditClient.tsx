'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Department, User, Entity } from '@/types';
import { ArrowLeft, Save, Upload, User as UserIcon, Trash2, AlertCircle, ShieldAlert, Camera, Loader2, X } from 'lucide-react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = user && ['CEO', 'HR', 'Admin', 'CXO'].includes(user.role);
    const canDelete = user && ['CEO', 'Admin'].includes(user.role);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    // Avatar state
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    // Reports-to candidates
    const [reportingCandidates, setReportingCandidates] = useState<{ id: string; name: string }[]>([]);

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

    // Helper to get avatar display URL
    const getAvatarUrl = (avatar?: string) => {
        if (!avatar) return undefined;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('blob:')) return avatar;
        return avatar.startsWith('/') ? avatar : `/${avatar}`;
    };

    const getInitials = () => {
        const name = formData.name?.trim();
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const getErrorMessage = (error: any): string => {
        if (!error) return 'Unknown error';

        if (error?.data?.detail) {
            const detail = error.data.detail;
            if (typeof detail === 'string') return detail;
            if (Array.isArray(detail)) {
                return detail
                    .map((d: any) => {
                        if (typeof d === 'string') return d;
                        const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : 'field';
                        const msg = d?.msg || 'Invalid value';
                        return `${String(field)}: ${msg}`;
                    })
                    .join(' | ');
            }
        }

        if (typeof error?.detail === 'string' && error.detail.trim()) {
            return error.detail;
        }

        if (typeof error?.message === 'string' && error.message.trim()) {
            return error.message;
        }

        return 'An unexpected error occurred. Please try again.';
    };

    useEffect(() => {
        async function fetchEmployee() {
            try {
                const { employeeApi } = await import('@/lib/api/employees');

                // Fetch employee + all employees (for reports-to dropdown) in parallel
                const [emp, allEmployees] = await Promise.all([
                    employeeApi.getById(employeeId),
                    employeeApi.getAll().catch(() => [] as any[]),
                ]);

                if (!emp) {
                    toast.error('Employee not found');
                    router.push('/people/employees');
                    return;
                }

                // Build reporting candidates (exclude self)
                const candidates = allEmployees
                    .filter((e: any) => e.id !== employeeId)
                    .map((e: any) => ({ id: e.id, name: e.name || e.email }));
                setReportingCandidates(candidates);

                // Helper to format date for input (yyyy-MM-dd)
                const formatDate = (dateString?: string) => {
                    if (!dateString) return '';
                    return dateString.split('T')[0];
                };

                // Map Employee (public) response to form data
                setFormData({
                    employeeId: emp.employeeId || emp.id,
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
        if (user.role === 'CEO') return true;
        const topAdminRoles = ['Admin', 'CEO', 'CFO', 'CTO', 'COO', 'CIO', 'CMO', 'HR'];
        const isCurrentUserTopAdmin = topAdminRoles.includes(user.role);
        const isTargetUserTopAdmin = topAdminRoles.includes(originalRole);
        if (isCurrentUserTopAdmin && !isTargetUserTopAdmin) return true;
        return false;
    };

    // Avatar handlers
    const onAvatarPick = () => {
        fileInputRef.current?.click();
    };

    const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            toast.error('Only JPEG, PNG, GIF, or WebP images are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be 5MB or smaller');
            return;
        }

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        // Upload right away
        setAvatarUploading(true);
        try {
            const { employeeApi } = await import('@/lib/api/employees');
            const result = await employeeApi.uploadAvatar(employeeId, file);
            setFormData(prev => ({ ...prev, image: result.avatar_url }));
            URL.revokeObjectURL(previewUrl);
            setAvatarPreview('');
            toast.success('Avatar uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(getErrorMessage(error));
            URL.revokeObjectURL(previewUrl);
            setAvatarPreview('');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        if (!formData.image) return;
        setAvatarUploading(true);
        try {
            const { employeeApi } = await import('@/lib/api/employees');
            await employeeApi.update(employeeId, { avatar: '' } as any);
            setFormData(prev => ({ ...prev, image: '' }));
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview('');
            }
            toast.success('Avatar removed');
        } catch (error: any) {
            console.error('Error deleting avatar:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setAvatarUploading(false);
        }
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
            toast.error(getErrorMessage(error));
            setFormData(prev => ({ ...prev, role: originalRole as any }));
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;
        setIsLoading(true);

        if (!formData.name || !formData.email || !formData.department) {
            toast.error('Please fill in all required fields marked with *');
            setIsLoading(false);
            return;
        }

        try {
            const { employeeApi } = await import('@/lib/api/employees');
            await employeeApi.update(employeeId, {
                email: formData.email,
                name: formData.name,
                role: formData.role,
                department: formData.department,
                title: formData.designation,
                isActive: formData.loginAllowed,
                salutation: formData.salutation,
                dateOfBirth: formData.dateOfBirth,
                mobile: formData.mobile,
                country: formData.country,
                gender: formData.gender,
                startDate: formData.joiningDate,
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
                reportsTo: formData.reportsTo,
            });
            toast.success('Employee updated successfully');
            router.push('/people/employees');
            router.refresh();
        } catch (error: any) {
            console.error('Error updating employee:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteDialog = () => {
        setConfirmText('');
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const expected = `DELETE ${formData.name}`;
        if (confirmText !== expected) {
            toast.error(`Please type "${expected}" to confirm deletion`);
            return;
        }
        setIsLoading(true);
        try {
            const { employeeApi } = await import('@/lib/api/employees');
            await employeeApi.delete(employeeId);
            toast.success('Employee deleted successfully');
            setDeleteOpen(false);
            router.push('/people/employees');
            router.refresh();
        } catch (error: any) {
            console.error('Error deleting employee:', error);
            toast.error(getErrorMessage(error));
            setIsLoading(false);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const handleCancelEdit = () => setIsEditing(false);

    if (isFetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Current display avatar: show preview if available, otherwise saved image
    const displayAvatar = avatarPreview || getAvatarUrl(formData.image);

    // Circular avatar component reused in both view and edit modes
    const renderAvatarCircle = (size: 'sm' | 'lg' = 'lg', showControls = false) => {
        const sizeClass = size === 'lg' ? 'h-28 w-28' : 'h-24 w-24';
        const textClass = size === 'lg' ? 'text-3xl' : 'text-2xl';
        return (
            <div className="relative inline-block">
                <div className={`${sizeClass} rounded-full overflow-hidden border-4 border-white shadow-lg bg-primary/10`}>
                    {displayAvatar ? (
                        <img src={displayAvatar} alt={formData.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className={`h-full w-full flex items-center justify-center text-primary font-bold ${textClass} uppercase`}>
                            {getInitials()}
                        </div>
                    )}
                </div>
                {showControls && (
                    <>
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                            onClick={onAvatarPick}
                            disabled={avatarUploading}
                        >
                            {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        </Button>
                        {formData.image && (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-md"
                                onClick={handleDeleteAvatar}
                                disabled={avatarUploading}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={onAvatarFileChange}
                />
            </div>
        );
    };

    const renderViewMode = () => (
        <div className="space-y-6">
            {/* Account Details View */}
            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 flex justify-center md:justify-start">
                        {renderAvatarCircle('lg', false)}
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                            <p className="font-medium">{formData.employeeId || '--'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="font-medium">{formData.salutation} {formData.name}</p>
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
                        <p className="font-medium">
                            {formData.reportsTo === 'none' ? 'None' : (
                                reportingCandidates.find(c => c.id === formData.reportsTo)?.name || formData.reportsTo || '--'
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.loginAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formData.loginAllowed ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Country</p>
                        <p className="font-medium">{formData.country || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Language</p>
                        <p className="font-medium">{formData.language || '--'}</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Business Address</p>
                        <p className="font-medium whitespace-pre-wrap">{formData.businessAddress || '--'}</p>
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
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Notice Ends</p>
                        <p className="font-medium">{formData.noticePeriodEndDate || '--'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
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
                                    <p className="font-semibold text-red-900">{formData.name}</p>
                                    <p className="text-sm text-red-700">{formData.designation} &middot; {formData.department}</p>
                                    <p className="text-xs text-red-600 mt-1">{formData.email}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs text-red-600">DELETE {formData.name}</code> to confirm
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={`DELETE ${formData.name}`}
                                className="font-mono text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isLoading || confirmText !== `DELETE ${formData.name}`}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isLoading ? 'Deleting...' : 'Delete Employee'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
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
                    {!isEditing && canEdit && (
                        <>
                            {canDelete && (
                                <Button variant="destructive" size="sm" onClick={openDeleteDialog} title="Delete Employee">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                            <Button onClick={() => setIsEditing(true)}>
                                <UserIcon className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </>
                    )}
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
                    <fieldset className="space-y-6">
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

                                {/* Avatar Upload — Circular with Camera Icon (matches create page) */}
                                <div className="space-y-2 md:col-span-2 row-span-2">
                                    <label className="text-sm font-medium">Profile Picture</label>
                                    <div className="flex items-center gap-4">
                                        {renderAvatarCircle('sm', true)}
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Round profile photo, max 5MB.</p>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={onAvatarPick} disabled={avatarUploading}>
                                                    {avatarUploading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        'Choose image'
                                                    )}
                                                </Button>
                                                {formData.image && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={handleDeleteAvatar} disabled={avatarUploading}>
                                                        <X className="h-4 w-4 mr-1" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
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
                                    <Select value={formData.reportsTo || 'none'} onValueChange={(v) => handleInputChange('reportsTo', v === 'none' ? '' : v)}>
                                        <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {reportingCandidates.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
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
                                            Role has been changed. Click &quot;Update Role&quot; to save this change.
                                        </p>
                                    )}
                                </div>

                                {/* Entity */}
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
                                    <label className="text-sm font-medium">Business Address</label>
                                    <Input
                                        value={formData.businessAddress}
                                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                        placeholder="e.g. Head Office"
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
                                            <Checkbox id="login-yes" checked={formData.loginAllowed} onCheckedChange={() => handleInputChange('loginAllowed', true)} />
                                            <label htmlFor="login-yes" className="text-sm">Yes</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="login-no" checked={!formData.loginAllowed} onCheckedChange={() => handleInputChange('loginAllowed', false)} />
                                            <label htmlFor="login-no" className="text-sm">No</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Receive email notifications?</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="notify-yes" checked={formData.emailNotifications} onCheckedChange={() => handleInputChange('emailNotifications', true)} />
                                            <label htmlFor="notify-yes" className="text-sm">Yes</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="notify-no" checked={!formData.emailNotifications} onCheckedChange={() => handleInputChange('emailNotifications', false)} />
                                            <label htmlFor="notify-no" className="text-sm">No</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hourly Rate</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">USD</span>
                                        <Input className="rounded-l-none" type="number" value={formData.hourlyRate} onChange={(e) => handleInputChange('hourlyRate', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slack Member ID</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">@</span>
                                        <Input className="rounded-l-none" value={formData.slackMemberId} onChange={(e) => handleInputChange('slackMemberId', e.target.value)} />
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
                                    <Input type="date" value={formData.probationEndDate} onChange={(e) => handleInputChange('probationEndDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notice Period Start Date</label>
                                    <Input type="date" value={formData.noticePeriodStartDate} onChange={(e) => handleInputChange('noticePeriodStartDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notice Period End Date</label>
                                    <Input type="date" value={formData.noticePeriodEndDate} onChange={(e) => handleInputChange('noticePeriodEndDate', e.target.value)} />
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
