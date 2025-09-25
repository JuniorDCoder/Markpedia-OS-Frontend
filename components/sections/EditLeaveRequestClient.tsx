'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveRequest } from '@/types';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Save, Loader2 } from 'lucide-react';
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
            type: 'Annual',
            startDate: '',
            endDate: '',
            days: 0,
            reason: '',
        }
    );

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
            }
        } catch (error) {
            toast.error('Failed to load leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await leaveRequestService.updateLeaveRequest(leaveRequestId, formData);
            toast.success('Leave request updated successfully');
            router.push('/people/leave');
        } catch (error) {
            toast.error('Failed to update leave request');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Calculate days if both dates are present
            if (newData.startDate && newData.endDate) {
                const start = new Date(newData.startDate);
                const end = new Date(newData.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                newData.days = diffDays;
            }

            return newData;
        });
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

            <Card>
                <CardHeader>
                    <CardTitle>Edit Leave Request</CardTitle>
                    <CardDescription>
                        Update the leave request information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Leave Type</Label>
                                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Annual">Annual Leave</SelectItem>
                                        <SelectItem value="Sick">Sick Leave</SelectItem>
                                        <SelectItem value="Personal">Personal Leave</SelectItem>
                                        <SelectItem value="Maternity">Maternity Leave</SelectItem>
                                        <SelectItem value="Emergency">Emergency Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="days">Duration (Days)</Label>
                                <Input
                                    id="days"
                                    type="number"
                                    min="1"
                                    value={formData.days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter the reason for leave"
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Update Request
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/people/leave/${leaveRequestId}`}>
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