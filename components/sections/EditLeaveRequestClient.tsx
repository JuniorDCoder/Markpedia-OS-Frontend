'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveRequest } from '@/types';
import { leaveRequestService } from '@/services/leaveRequestService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Save, Loader2, Upload, User, Phone } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { departmentsApi } from '@/lib/api/departments';

interface EditLeaveRequestClientProps {
    leaveRequestId: string;
    initialData?: LeaveRequest;
    // accept optional extra props passed by parent to avoid TS errors
    tasks?: any[];
    projects?: any[];
    users?: any[];
}

const LEAVE_REASONS: Record<string, string[]> = {
    Annual: ['Vacation', 'Personal', 'Family'],
    Sick: ['Illness', 'Medical appointment'],
    Maternity: ['Maternity'],
    Paternity: ['Paternity'],
    Compassionate: ['Bereavement'],
    Study: ['Exams'],
    Official: ['Training / Official Duty'],
    Unpaid: ['Unpaid leave']
};

export default function EditLeaveRequestClient({ leaveRequestId, initialData, tasks, projects, users }: EditLeaveRequestClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(!initialData);
    const [saving, setSaving] = useState(false);

    // Expand initial form fields to include missing editable fields
    const [formData, setFormData] = useState<Partial<LeaveRequest>>(
        initialData || {
            leave_type: 'Annual',
            start_date: '',
            end_date: '',
            total_days: 0,
            reason: '',
            backup_person: '',
            contact_during_leave: '',
            leave_category: 'Paid', // new
            hr_notes: '',
            is_emergency: false,
            emergency_contact: '',
            task_project: '',
            proof: undefined,
            department_id: undefined,
        }
    );

    // New: departments
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);

    useEffect(() => {
        if (!initialData) {
            loadLeaveRequest();
        } else {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
        loadDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDepartments = async () => {
        try {
            setDepartmentsLoading(true);
            const list = await departmentsApi.getAll({ limit: 1000 });
            setDepartments(Array.isArray(list) ? list : []);
        } catch (err) {
            // ignore failures gracefully
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const loadLeaveRequest = async () => {
        try {
            setLoading(true);
            const request = await leaveRequestService.getLeaveRequest(leaveRequestId);
            if (request) {
                setFormData(request);
            }
        } catch (error) {
            toast.error('Failed to load leave request');
        } finally {
            setLoading(false);
        }
    };

    // small helper to update fields
    const setField = (key: keyof LeaveRequest | string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Existing handleDateChange but keep calculating working days
    const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            if (newData.start_date && newData.end_date) {
                const start = new Date(newData.start_date as string);
                const end = new Date(newData.end_date as string);
                let workingDays = 0;
                let currentDate = new Date(start);
                while (currentDate <= end) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                (newData as any).total_days = workingDays;
            }
            return newData;
        });
    };

    const getReasonsForType = (type: string) => {
        return LEAVE_REASONS[type] || [];
    };

    const canEdit = formData.status === 'Pending';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            // Prepare payload - include newly added fields
            const payload: any = {
                ...formData,
                reason: formData.reason,
                leave_category: formData.leave_category,
                hr_notes: formData.hr_notes,
                is_emergency: formData.is_emergency,
                emergency_contact: formData.emergency_contact,
                task_project: formData.task_project,
                backup_person: formData.backup_person,
                contact_during_leave: formData.contact_during_leave,
                updated_at: new Date().toISOString()
            };

            // If proof is a File, we only send filename placeholder here.
            // Backend file upload should be handled separately (not in this minimal fix).
            if ((payload.proof as any)?.name) {
                payload.proof = (payload.proof as any).name;
            }

            await leaveRequestService.updateLeaveRequest(leaveRequestId, payload);
            toast.success('Leave request updated successfully');
            router.push(`/people/leave/${leaveRequestId}`);
        } catch (error) {
            toast.error('Failed to update leave request');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ...existing header UI... */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/people/leave/${leaveRequestId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Details
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Calendar className="h-8 w-8 mr-3" />
                        Edit Leave Request
                    </h1>
                    <p className="text-muted-foreground mt-2">Update leave request details</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Leave Request</CardTitle>
                    <CardDescription>
                        {canEdit ? "Update the leave request information below" : "View the leave request information below"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Leave Type */}
                            <div className="space-y-2">
                                <Label htmlFor="leave_type">Leave Type</Label>
                                <Select
                                    value={formData.leave_type}
                                    onValueChange={(value: any) => setField('leave_type', value)}
                                    disabled={!canEdit}
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

                            {/* Leave Category (new) */}
                            <div className="space-y-2">
                                <Label htmlFor="leave_category">Leave Category</Label>
                                <Select
                                    value={String(formData.leave_category || 'Paid')}
                                    onValueChange={(v) => setField('leave_category', v)}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        <SelectItem value="Half-pay">Half-pay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="total_days">Duration (Working Days)</Label>
                                <Input
                                    id="total_days"
                                    type="number"
                                    min="1"
                                    value={String(formData.total_days ?? 0)}
                                    onChange={(e) => setField('total_days', parseInt(e.target.value) || 0)}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Calculated automatically excluding weekends</p>
                            </div>

                            {/* Department selector (if available) */}
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Select
                                    value={String(formData.department_id || '')}
                                    onValueChange={(v) => setField('department_id', v)}
                                    disabled={!canEdit || departmentsLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">Unchanged</SelectItem>
                                        {departments.map(dep => (
                                            <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input id="start_date" type="date" value={String(formData.start_date || '')} onChange={(e) => handleDateChange('start_date', e.target.value)} disabled={!canEdit} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input id="end_date" type="date" value={String(formData.end_date || '')} onChange={(e) => handleDateChange('end_date', e.target.value)} disabled={!canEdit} min={String(formData.start_date || '')} />
                            </div>
                        </div>

                        {/* Reason selection & custom reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason-select">Select Reason</Label>
                            <Select value={String(formData.reason || '')} onValueChange={(v) => setField('reason', v)} disabled={!canEdit}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${String(formData.leave_type || '').toLowerCase()} reason`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {String(formData.leave_type) && getReasonsForType(String(formData.leave_type)).map((reason, index) => (
                                        <SelectItem key={index} value={reason}>{reason}</SelectItem>
                                    ))}
                                    <SelectItem value={String(formData.reason || '')}>Keep current / Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea id="reason" placeholder="Please provide a detailed reason for your leave request..." value={String(formData.reason || '')} onChange={(e) => setField('reason', e.target.value)} rows={3} disabled={!canEdit}/>
                        </div>

                        {/* Additional Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Backup Person</Label>
                                <Input value={String(formData.backup_person || '')} onChange={(e) => setField('backup_person', e.target.value)} disabled={!canEdit}/>
                            </div>
                            <div className="space-y-2">
                                <Label>Contact During Leave</Label>
                                <Input value={String(formData.contact_during_leave || '')} onChange={(e) => setField('contact_during_leave', e.target.value)} disabled={!canEdit}/>
                            </div>
                            <div className="space-y-2">
                                <Label>Task / Project</Label>
                                <Input value={String(formData.task_project || '')} onChange={(e) => setField('task_project', e.target.value)} disabled={!canEdit}/>
                            </div>
                            <div className="space-y-2">
                                <Label>Emergency</Label>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={Boolean(formData.is_emergency)} onChange={(e) => setField('is_emergency', e.target.checked)} disabled={!canEdit}/>
                                    <Input placeholder="Emergency contact" value={String(formData.emergency_contact || '')} onChange={(e) => setField('emergency_contact', e.target.value)} disabled={!canEdit}/>
                                </div>
                            </div>
                        </div>

                        {/* Proof upload (simple) */}
                        <div className="space-y-2">
                            <Label>Supporting Document (optional)</Label>
                            <input type="file" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setField('proof', file);
                            }} disabled={!canEdit} />
                            {formData.proof && typeof formData.proof === 'string' && <p className="text-xs text-muted-foreground">Current file: {formData.proof}</p>}
                        </div>

                        {/* HR Notes (editable only if HR/Admin/CEO) */}
                        <div className="space-y-2">
                            <Label>HR Notes</Label>
                            <Textarea value={String(formData.hr_notes || '')} onChange={(e) => setField('hr_notes', e.target.value)} rows={3} disabled={!user || !['HR','CEO','Admin'].includes((user.role || '').toString())}/>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {canEdit && (
                                <Button type="submit" disabled={saving}>
                                    {saving ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<Save className="h-4 w-4 mr-2" />)}
                                    Update Request
                                </Button>
                            )}
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/people/leave/${leaveRequestId}`}>{canEdit ? 'Cancel' : 'Back to Details'}</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}