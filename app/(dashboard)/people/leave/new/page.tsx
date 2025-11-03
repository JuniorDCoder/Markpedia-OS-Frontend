'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { leaveRequestService, LEAVE_REASONS } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Plus, Loader2, Upload, User, Phone, Mail, Briefcase } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Mock data for tasks/projects - in a real app, this would come from an API
const MOCK_TASKS = [
    { id: '1', name: 'Q4 Sales Report Preparation', project: 'Sales Reporting', department: 'Sales' },
    { id: '2', name: 'Customer Database Cleanup', project: 'CRM Maintenance', department: 'Sales' },
    { id: '3', name: 'Marketing Campaign Analysis', project: 'Q1 Campaign Review', department: 'Marketing' },
    { id: '4', name: 'Website Content Updates', project: 'Website Revamp', department: 'Marketing' },
    { id: '5', name: 'Employee Training Materials', project: 'Training Development', department: 'HR' },
    { id: '6', name: 'Recruitment Process Documentation', project: 'HR Process Improvement', department: 'HR' },
    { id: '7', name: 'Budget Planning for Next Quarter', project: 'Financial Planning', department: 'Finance' },
    { id: '8', name: 'Expense Report Automation', project: 'Process Automation', department: 'Finance' },
    { id: '9', name: 'Product Feature Documentation', project: 'Product Development', department: 'Engineering' },
    { id: '10', name: 'Code Review and Refactoring', project: 'Technical Debt Reduction', department: 'Engineering' },
];

export default function NewLeaveRequestPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: 'Annual' as const,
        start_date: '',
        end_date: '',
        total_days: 0,
        reason: '',
        backup_person: '',
        contact_during_leave: '',
        task_project: '', // New field
        proof: null as File | null
    });
    const [selectedReason, setSelectedReason] = useState('');

    // Filter tasks based on user's department
    const filteredTasks = MOCK_TASKS.filter(task =>
        user?.department && task.department === user.department
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit a leave request');
            return;
        }

        // Validate dates
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            setSaving(true);

            // Prepare proof data
            const proofData = formData.proof ? {
                filename: formData.proof.name,
                type: formData.proof.type,
                size: formData.proof.size
            } : undefined;

            await leaveRequestService.createLeaveRequest({
                employee_id: user.id,
                department_id: user.departmentId || '1',
                userName: user.name,
                departmentName: user.department || 'General',
                leave_type: formData.leave_type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_days: formData.total_days,
                reason: selectedReason || formData.reason,
                status: 'Pending',
                proof: proofData,
                applied_on: new Date().toISOString().split('T')[0],
                backup_person: formData.backup_person,
                contact_during_leave: formData.contact_during_leave,
                task_project: formData.task_project, // Include new field
                balance_before: undefined,
                balance_after: undefined,
                remarks: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            toast.success('Leave request submitted successfully');
            router.push('/people/leave');
        } catch (error) {
            toast.error('Failed to submit leave request');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Calculate days if both dates are present
            if (newData.start_date && newData.end_date) {
                const start = new Date(newData.start_date);
                const end = new Date(newData.end_date);

                // Calculate working days (exclude weekends)
                let workingDays = 0;
                let currentDate = new Date(start);

                while (currentDate <= end) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
                        workingDays++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                newData.total_days = workingDays;
            }

            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a PDF, JPG, or PNG file');
                return;
            }

            if (file.size > maxSize) {
                toast.error('File size must be less than 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, proof: file }));
        }
    };

    const getReasonsForType = (type: string) => {
        return LEAVE_REASONS[type as keyof typeof LEAVE_REASONS] || [];
    };

    const requiresProof = formData.leave_type === 'Sick' || formData.leave_type === 'Study';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/leave">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Leave Requests
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Calendar className="h-8 w-8 mr-3" />
                        New Leave Request
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Submit a new leave request in compliance with Cameroon Labour Code
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Request Information</CardTitle>
                    <CardDescription>
                        Fill in the details for your leave request. All fields marked with * are required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Leave Type and Duration */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="leave_type">Leave Type *</Label>
                                <Select
                                    value={formData.leave_type}
                                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, leave_type: value, reason: '' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Annual">Annual Leave</SelectItem>
                                        <SelectItem value="Sick">Sick Leave</SelectItem>
                                        <SelectItem value="Maternity">Maternity Leave</SelectItem>
                                        <SelectItem value="Paternity">Paternity Leave</SelectItem>
                                        <SelectItem value="Compassionate">Compassionate Leave</SelectItem>
                                        <SelectItem value="Study">Study / Examination Leave</SelectItem>
                                        <SelectItem value="Official">Official / Duty Leave</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_days">Duration (Working Days) *</Label>
                                <Input
                                    id="total_days"
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.total_days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, total_days: parseInt(e.target.value) || 0 }))}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Calculated automatically excluding weekends
                                </p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date *</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        {/* Task/Project Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="task_project">
                                <Briefcase className="h-4 w-4 inline mr-1" />
                                Task/Project to Work On During Leave
                                <span className="text-muted-foreground text-sm ml-2">(Optional)</span>
                            </Label>
                            <Select value={formData.task_project} onValueChange={(value) => setFormData(prev => ({ ...prev, task_project: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a task or project you plan to work on" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None - Complete time off</SelectItem>
                                    {filteredTasks.map((task) => (
                                        <SelectItem key={task.id} value={task.name}>
                                            {task.name} ({task.project})
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="other">Other (specify in reason)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select a task you plan to work on remotely during your leave, if applicable
                            </p>
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="reason-select">Select Reason *</Label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${formData.leave_type.toLowerCase()} reason`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getReasonsForType(formData.leave_type).map((reason, index) => (
                                        <SelectItem key={index} value={reason}>
                                            {reason}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                {selectedReason ? 'Additional Details' : 'Reason for Leave *'}
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder={
                                    selectedReason
                                        ? "Provide additional details about your leave request..."
                                        : "Please provide a detailed reason for your leave request..."
                                }
                                required={!selectedReason}
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Supporting Document */}
                        {requiresProof && (
                            <div className="space-y-2">
                                <Label htmlFor="proof">
                                    Supporting Document *
                                    <span className="text-muted-foreground text-sm ml-2">
                                        (PDF, JPG, PNG - Max 5MB)
                                    </span>
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="proof"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="flex-1"
                                    />
                                    {formData.proof && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <Upload className="h-4 w-4" />
                                            {formData.proof.name}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formData.leave_type === 'Sick'
                                        ? 'Medical certificate required for sick leave exceeding 2 days'
                                        : 'Proof of enrollment or exam schedule required for study leave'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Optional Supporting Document for other types */}
                        {!requiresProof && (
                            <div className="space-y-2">
                                <Label htmlFor="proof-optional">
                                    Supporting Document
                                    <span className="text-muted-foreground text-sm ml-2">
                                        (Optional - PDF, JPG, PNG - Max 5MB)
                                    </span>
                                </Label>
                                <Input
                                    id="proof-optional"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}

                        {/* Backup Person and Contact Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="backup_person">
                                    <User className="h-4 w-4 inline mr-1" />
                                    Backup Person
                                </Label>
                                <Input
                                    id="backup_person"
                                    placeholder="Who will cover your duties?"
                                    value={formData.backup_person}
                                    onChange={(e) => setFormData(prev => ({ ...prev, backup_person: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_during_leave">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Contact During Leave
                                </Label>
                                <Input
                                    id="contact_during_leave"
                                    placeholder="Phone or email for emergencies"
                                    value={formData.contact_during_leave}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_during_leave: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Policy Reminder */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 text-sm flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Leave Policy Reminder
                            </h4>
                            <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                <li>• Annual Leave: 1.5 working days per month of service (18 days/year)</li>
                                <li>• Sick Leave: Medical certificate required for absences exceeding 2 days</li>
                                <li>• Maternity Leave: 14 weeks (4 before + 10 after childbirth)</li>
                                <li>• Paternity Leave: 3-5 days during childbirth period</li>
                                <li>• All leave requests subject to manager and HR approval</li>
                                <li>• Remote work during leave is optional and requires prior agreement</li>
                            </ul>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={saving} className="flex-1">
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Submit Leave Request
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/people/leave">
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}