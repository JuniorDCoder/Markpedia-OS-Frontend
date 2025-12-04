'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { leaveRequestService } from '@/services/leaveRequestService';
import { taskService, projectService, userService } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Calendar, Briefcase, User as UserIcon, Phone, Upload, Loader2 } from 'lucide-react';

// Exhaustive reasons map (can be extended)
const LEAVE_REASONS: Record<string, string[]> = {
    Annual: ['Vacation', 'Family Trip', 'Personal Time', 'Relocation', 'Long Service Leave'],
    Sick: ['Medical Illness', 'Medical Appointment', 'Hospitalization', 'Contagious Illness'],
    Maternity: ['Pregnancy Leave', 'Postnatal Recovery', 'Medical Complication'],
    Paternity: ['Childbirth Support', 'Adoption Support'],
    Compassionate: ['Bereavement', 'Family Emergency'],
    Study: ['Exams', 'Coursework', 'Training Program'],
    Official: ['Business Travel', 'Conference', 'Official Duties'],
    Unpaid: ['Extended Personal Leave', 'Sabbatical', 'Unpaid Time Off'],
    Personal: ['Mental Health', 'Personal Matters'],
    Emergency: ['Emergency Leave']
};

export default function NewLeaveRequestPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [formData, setFormData] = useState({
        leave_type: 'Annual' as const,
        start_date: '',
        end_date: '',
        total_days: 0,
        reason: '',
        backup_person: '',
        backup_person_id: '', // optional selected user id
        contact_during_leave: '',
        task_project: '', // will store "task:<id>" or "project:<id>" or raw text
        proof: null as File | null
    });
    const [selectedReason, setSelectedReason] = useState('');
    const [backupMode, setBackupMode] = useState<'existing' | 'custom'>('existing');

    // Load tasks/projects/users instead of using mock data
    useEffect(() => {
        const loadOptions = async () => {
            setLoadingOptions(true);
            try {
                // Note: services exported from /services/api.ts provide taskService/projectService/userService
                const [allTasks, projList, allUsers] = await Promise.all([
                    taskService.getTasks().catch(() => []),
                    projectService.getProjects().catch(() => []),
                    userService.getUsers().catch(() => [])
                ]);
                setTasks(Array.isArray(allTasks) ? allTasks : []);
                setProjects(Array.isArray(projList) ? projList : []);
                setUsers(Array.isArray(allUsers) ? allUsers : []);
            } catch (err) {
                console.error('Failed to load options', err);
            } finally {
                setLoadingOptions(false);
            }
        };

        loadOptions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit a leave request');
            return;
        }

        if (!formData.start_date || !formData.end_date) {
            toast.error('Please provide both start and end dates');
            return;
        }

        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            setSaving(true);

            const proofData = formData.proof ? {
                filename: formData.proof.name,
                type: formData.proof.type,
                size: formData.proof.size
            } : undefined;

            // Determine backup person name: selected user or custom input
            let backupPersonName = formData.backup_person;
            if (backupMode === 'existing' && formData.backup_person_id) {
                const sel = users.find(u => u.id === formData.backup_person_id);
                if (sel) backupPersonName = [sel.firstName, sel.lastName].filter(Boolean).join(' ') || sel.name || sel.email || '';
            }

            // Determine task/project selection payload
            let taskProjectPayload: string | undefined = undefined;
            if (formData.task_project) {
                if (formData.task_project.startsWith('task:')) {
                    const id = formData.task_project.replace('task:', '');
                    const t = tasks.find(tsk => String(tsk.id) === id);
                    if (t) taskProjectPayload = `Task: ${t.title || t.name || id}`;
                } else if (formData.task_project.startsWith('project:')) {
                    const id = formData.task_project.replace('project:', '');
                    const p = projects.find(pr => String(pr.id) === id);
                    if (p) taskProjectPayload = `Project: ${p.title || p.name || id}`;
                } else {
                    taskProjectPayload = formData.task_project;
                }
            }

            await leaveRequestService.createLeaveRequest({
                employee_id: user.id,
                department_id: user.departmentId || '1',
                user_name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                department_name: user.department || 'General',
                leave_type: formData.leave_type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_days: formData.total_days,
                reason: selectedReason || formData.reason,
                status: 'Pending',
                proof: proofData,
                applied_on: new Date().toISOString().split('T')[0],
                backup_person: backupPersonName,
                contact_during_leave: formData.contact_during_leave,
                task_project: taskProjectPayload,
                balance_before: undefined,
                balance_after: undefined,
                remarks: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            toast.success('Leave request submitted successfully');
            router.push('/people/leave');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit leave request');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

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

    // Helper to render tasks/projects select options
    const renderTaskProjectOptions = () => {
        if (loadingOptions) return <SelectItem value="loading">Loading...</SelectItem>;
        const items: JSX.Element[] = [];
        items.push(<SelectItem key="none" value=" ">None - Complete time off</SelectItem>);
        if (tasks.length > 0) {
            items.push(<SelectItem key="tasks-header" value="___tasks_header" disabled>--- Tasks ---</SelectItem>);
            tasks.forEach(t => items.push(
                <SelectItem key={`task-${t.id}`} value={`task:${t.id}`}>
                    {t.title || t.name || t.task || `Task ${t.id}`}
                </SelectItem>
            ));
        }
        if (projects.length > 0) {
            items.push(<SelectItem key="projects-header" value="___projects_header" disabled>--- Projects ---</SelectItem>);
            projects.forEach(p => items.push(
                <SelectItem key={`project-${p.id}`} value={`project:${p.id}`}>
                    {p.title || p.name || `Project ${p.id}`}
                </SelectItem>
            ));
        }
        items.push(<SelectItem key="other" value="other">Other (specify in reason)</SelectItem>);
        return items;
    };

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
                                    onValueChange={(value: any) => {
                                        setFormData(prev => ({ ...prev, leave_type: value, reason: '' }));
                                        setSelectedReason('');
                                    }}
                                >
                                    <SelectTrigger id="leave_type">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(LEAVE_REASONS).map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
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
                                Task/Project (optional)
                            </Label>
                            <Select value={formData.task_project} onValueChange={(value) => setFormData(prev => ({ ...prev, task_project: value }))}>
                                <SelectTrigger id="task_project">
                                    <SelectValue placeholder="Select a task or project or other" />
                                </SelectTrigger>
                                <SelectContent>
                                    {renderTaskProjectOptions()}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select a task or project related to this leave (if planning to work remotely). If "Other", specify in the reason.
                            </p>
                        </div>

                        {/* Reason Selection */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="reason-select">Select Reason *</Label>
                                <Select value={selectedReason} onValueChange={(v: any) => { setSelectedReason(v); setFormData(prev => ({ ...prev, reason: '' })); }}>
                                    <SelectTrigger id="reason-select">
                                        <SelectValue placeholder={`Select ${formData.leave_type.toLowerCase()} reason`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(LEAVE_REASONS[formData.leave_type] || []).map((reason, index) => (
                                            <SelectItem key={index} value={reason}>
                                                {reason}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Other">Other (specify below)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Backup Person *</Label>
                                <div className="flex gap-2">
                                    <Select value={backupMode} onValueChange={(v: any) => setBackupMode(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="existing">Select User</SelectItem>
                                            <SelectItem value="custom">Enter Name</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {backupMode === 'existing' ? (
                                        <Select value={formData.backup_person_id} onValueChange={(v: any) => setFormData(prev => ({ ...prev, backup_person_id: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>
                                                        {u.firstName || u.name} {u.lastName ? ` ${u.lastName}` : ''} {u.position ? ` • ${u.position}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            placeholder="Backup person name"
                                            value={formData.backup_person}
                                            onChange={(e) => setFormData(prev => ({ ...prev, backup_person: e.target.value }))}
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Choose an existing user or type a custom name. This person will be responsible while you're away.
                                </p>
                            </div>
                        </div>

                        {/* Custom Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                {selectedReason && selectedReason !== 'Other' ? 'Additional Details (optional)' : 'Reason for Leave *'}
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder={
                                    selectedReason && selectedReason !== 'Other'
                                        ? "Provide additional details about your leave request..."
                                        : "Please provide a detailed reason for your leave request..."
                                }
                                required={!selectedReason || selectedReason === 'Other'}
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Supporting Document */}
                        <div className="space-y-2">
                            <Label htmlFor="proof">
                                Supporting Document
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
                        </div>

                        {/* Backup Contact */}
                        <div className="grid gap-4 md:grid-cols-2">
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

                            <div className="space-y-2">
                                <Label>Task/Project Selected</Label>
                                <div className="text-sm text-muted-foreground">
                                    {formData.task_project ? (formData.task_project.startsWith('task:') ? `Task selected` : formData.task_project.startsWith('project:') ? `Project selected` : 'Custom') : 'None'}
                                </div>
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