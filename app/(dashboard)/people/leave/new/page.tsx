'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewLeaveRequestPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Annual' as const,
        startDate: '',
        endDate: '',
        days: 0,
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit a leave request');
            return;
        }

        try {
            setSaving(true);
            await leaveRequestService.createLeaveRequest({
                ...formData,
                userId: user.id,
                userName: user.name,
                status: 'Pending',
            });
            toast.success('Leave request submitted successfully');
            router.push('/people/leave');
        } catch (error) {
            toast.error('Failed to submit leave request');
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
                        Submit a new leave request
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Request Information</CardTitle>
                    <CardDescription>
                        Fill in the details for your leave request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Leave Type *</Label>
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
                                <Label htmlFor="days">Duration (Days) *</Label>
                                <Input
                                    id="days"
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Leave *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a detailed reason for your leave request"
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Submit Request
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