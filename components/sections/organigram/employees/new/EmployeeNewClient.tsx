'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Department, User, Entity } from '@/types';
import { ArrowLeft, Save, Upload, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeNewClientProps {
    departments: Department[];
    entities?: Entity[];
    user: User;
}

export default function EmployeeNewClient({ departments, entities = [], user }: EmployeeNewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Account Details
        employeeId: 'Auto-generated',
        salutation: '',
        name: '',
        email: '',
        password: '', // Added password field
        dateOfBirth: '',
        designation: '',
        department: '',
        country: '',
        mobile: '',
        gender: '',
        joiningDate: new Date().toISOString().split('T')[0],
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

        entityId: '', // Added for compatibility with legacy organization logic
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.joiningDate) {
            toast.error('Please fill in all required fields marked with *');
            setIsLoading(false);
            return;
        }

        try {
            const { employeeApi } = await import('@/lib/api/employees');


            await employeeApi.create({
                name: formData.name,
                email: formData.email,
                password: formData.password, // Pass password
                role: formData.role,
                department: formData.department,
                title: formData.designation, // Map designation to title
                isActive: formData.loginAllowed, // Map loginAllowed to isActive

                // Extended fields
                salutation: formData.salutation,
                dateOfBirth: formData.dateOfBirth,
                mobile: formData.mobile,
                country: formData.country,
                gender: formData.gender,
                startDate: formData.joiningDate, // Map joiningDate to startDate
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

                entityId: formData.entityId || (entities.length > 0 ? entities[0].id : undefined)
            });

            toast.success('Employee created successfully');
            router.push('/people/employees');
            router.refresh();
        } catch (error) {
            console.error('Error creating employee:', error);
            toast.error('Failed to create employee');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Employee</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create a new employee profile with full details.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/people/employees">Cancel</Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Details */}
                <Card>
                    <CardHeader className="border-b bg-gray-50/50">
                        <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Row 1 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employee ID <span className="text-red-500">*</span></label>
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
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                            <Input
                                type="password"
                                placeholder="Enter initial password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 row-span-2">
                            <label className="text-sm font-medium">Profile Picture</label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-gray-50 transition-colors h-full">
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
                            <label className="text-sm font-medium">Joining Date <span className="text-red-500">*</span></label>
                            <Input
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reporting To</label>
                            <Select value={formData.reportsTo} onValueChange={(v) => handleInputChange('reportsTo', v)}>
                                <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {/* Ideally populate with existing employees */}
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
                            <Select value={formData.role} onValueChange={(v: any) => handleInputChange('role', v)}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Employee">Employee</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    {user.role === 'CEO' && <SelectItem value="CEO">CEO</SelectItem>}
                                    {user.role === 'CEO' && <SelectItem value="Admin">Admin</SelectItem>}
                                    {user.role === 'CEO' && <SelectItem value="CXO">CXO</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hidden Entity ID for legacy - select the first available global one if needed, or user adds in future */}
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

                {/* Other Details */}
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

                {/* Settings / Additional Info */}
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

                {/* Dates and Employment Details */}
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
                            <label className="text-sm font-medium">Business Address <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.businessAddress}
                                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                placeholder="e.g. Head Office"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" size="lg" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white min-w-[150px]">
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" size="lg" disabled={isLoading}>
                        Save & Add More
                    </Button>
                    <Button type="button" variant="ghost" size="lg" asChild>
                        <Link href="/people/employees">Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}