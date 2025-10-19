'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveRequest } from '@/types';
import { leaveRequestService, LEAVE_REASONS } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Save, Loader2, Upload, User, Phone } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EditLeaveRequestClientProps {
    leaveRequestId: string;
    initialData?: LeaveRequest;
}

export default function EditLeaveRequestClient({ leaveRequestId, initialData }: EditLeaveRequestClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(!initialData);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<LeaveRequest>>(
        initialData || {
            leave_type: 'Annual',
            start_date: '',
            end_date: '',
            total_days: 0,
            reason: '',
            backup_person: '',
            contact_during_leave: '',
        }
    );
    const [selectedReason, setSelectedReason] = useState(initialData?.reason || '');

    useEffect(() => {
        if (!initialData) {
            loadLeaveRequest();
        }
    }, []);

    const loadLeaveRequest = async () => {
        try {
            setLoading(true);
            const request = await leaveRequestService.getLeaveRequest(leaveRequestId);
            if (request) {
                setFormData(request);
                setSelectedReason(request.reason);
            }
        } catch (error) {
            toast.error('Failed to load leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            await leaveRequestService.updateLeaveRequest(leaveRequestId, {
                ...formData,
                reason: selectedReason || formData.reason,
                updated_at: new Date().toISOString()
            });
            toast.success('Leave request updated successfully');
            router.push(`/people/leave/${leaveRequestId}`);
        } catch (error) {
            toast.error('Failed to update leave request');
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

    const getReasonsForType = (type: string) => {
        return LEAVE_REASONS[type as keyof typeof LEAVE_REASONS] || [];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const canEdit = formData.status === 'Pending';

    return (
        <div className="space-y-6">
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
                    <p className="text-muted-foreground mt-2">
                        Update leave request details
                    </p>
                </div>
            </div>

            {!canEdit && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                            <h4 className="font-medium text-yellow-800">Editing Restricted</h4>
                            <p className="text-sm text-yellow-700">
                                This leave request can no longer be edited because it has already been processed.
                                Only pending requests can be modified.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Edit Leave Request</CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Update the leave request information below"
                            : "View the leave request information below"
                        }
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
                                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, leave_type: value }))}
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

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="total_days">Duration (Working Days)</Label>
                                <Input
                                    id="total_days"
                                    type="number"
                                    min="1"
                                    value={formData.total_days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, total_days: parseInt(e.target.value) || 0 }))}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Calculated automatically excluding weekends
                                </p>
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                                    disabled={!canEdit}
                                    min={formData.start_date}
                                />
                            </div>
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="reason-select">Select Reason</Label>
                            <Select
                                value={selectedReason}
                                onValueChange={setSelectedReason}
                                disabled={!canEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${formData.leave_type?.toLowerCase()} reason`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.leave_type && getReasonsForType(formData.leave_type).map((reason, index) => (
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
                                {selectedReason ? 'Additional Details' : 'Reason for Leave'}
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder={
                                    selectedReason
                                        ? "Provide additional details about your leave request..."
                                        : "Please provide a detailed reason for your leave request..."
                                }
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                disabled={!canEdit}
                            />
                        </div>

                        {/* Additional Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="backup_person">
                                    <User className="h-4 w-4 inline mr-1" />
                                    Backup Person
                                </Label>
                                <Input
                                    id="backup_person"
                                    placeholder="Who will cover your duties?"
                                    value={formData.backup_person || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, backup_person: e.target.value }))}
                                    disabled={!canEdit}
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
                                    value={formData.contact_during_leave || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_during_leave: e.target.value }))}
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 text-sm mb-2">Current Status</h4>
                            <div className="flex items-center gap-2">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                    formData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        formData.status === 'Manager Approved' ? 'bg-blue-100 text-blue-800' :
                                            formData.status === 'HR Approved' ? 'bg-green-100 text-green-800' :
                                                formData.status === 'CEO Approved' ? 'bg-green-100 text-green-800' :
                                                    formData.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                }`}>
                                    {formData.status}
                                </div>
                                <span className="text-xs text-gray-600">
                                    Last updated: {new Date(formData.updated_at || '').toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {canEdit && (
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Update Request
                                </Button>
                            )}
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/people/leave/${leaveRequestId}`}>
                                    {canEdit ? 'Cancel' : 'Back to Details'}
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}