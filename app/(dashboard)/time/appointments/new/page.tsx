'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { timeManagementService } from '@/lib/api/time-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Plus, Calendar, Clock, User, Video, Phone } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewAppointmentPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        meetingSubject: '',
        duration: 30,
        mode: 'in-person' as 'in-person' | 'virtual' | 'call',
        priority: 'normal' as 'normal' | 'urgent',
        attachments: [] as string[],
        preferredDates: [
            { date: '', time: '09:00' },
            { date: '', time: '14:00' },
            { date: '', time: '16:00' }
        ]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to request an appointment');
            return;
        }

        // Validate required fields
        if (!form.meetingSubject) {
            toast.error('Please enter a meeting subject');
            return;
        }

        const hasPreferredDates = form.preferredDates.some(pref => pref.date);
        if (!hasPreferredDates) {
            toast.error('Please select at least one preferred date');
            return;
        }

        setSaving(true);
        try {
            await timeManagementService.createAppointmentRequest({
                requesterName: user.name,
                department: user.department || 'General',
                meetingSubject: form.meetingSubject,
                preferredDates: form.preferredDates.filter(pref => pref.date),
                duration: form.duration,
                mode: form.mode,
                priority: form.priority,
                attachments: form.attachments,
                paDecision: 'pending'
            });

            toast.success('Appointment request submitted successfully!');
            router.push('/time');
        } catch (error) {
            toast.error('Failed to submit appointment request');
        } finally {
            setSaving(false);
        }
    };

    const updatePreferredDate = (index: number, field: 'date' | 'time', value: string) => {
        setForm(prev => ({
            ...prev,
            preferredDates: prev.preferredDates.map((pref, i) =>
                i === index ? { ...pref, [field]: value } : pref
            )
        }));
    };

    const addPreferredDate = () => {
        setForm(prev => ({
            ...prev,
            preferredDates: [...prev.preferredDates, { date: '', time: '09:00' }]
        }));
    };

    const removePreferredDate = (index: number) => {
        if (form.preferredDates.length > 1) {
            setForm(prev => ({
                ...prev,
                preferredDates: prev.preferredDates.filter((_, i) => i !== index)
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/time">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Time Management
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <Calendar className="h-8 w-8 mr-3" />
                    Request CEO Appointment
                </h1>
                <p className="text-muted-foreground mt-2">
                    Submit a request for time with the CEO. Your request will be reviewed by the Executive Assistant.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>
                            Provide details about the meeting you'd like to schedule with the CEO
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meetingSubject">Meeting Subject *</Label>
                                <Input
                                    id="meetingSubject"
                                    value={form.meetingSubject}
                                    onChange={(e) => setForm(prev => ({ ...prev, meetingSubject: e.target.value }))}
                                    placeholder="Brief description of what you'd like to discuss"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes) *</Label>
                                    <Select
                                        value={form.duration.toString()}
                                        onValueChange={(value) => setForm(prev => ({ ...prev, duration: parseInt(value) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="45">45 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mode">Meeting Mode *</Label>
                                    <Select
                                        value={form.mode}
                                        onValueChange={(value: 'in-person' | 'virtual' | 'call') =>
                                            setForm(prev => ({ ...prev, mode: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in-person">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2" />
                                                    In-person
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="virtual">
                                                <div className="flex items-center">
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Virtual
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="call">
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Phone Call
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={form.priority}
                                        onValueChange={(value: 'normal' | 'urgent') =>
                                            setForm(prev => ({ ...prev, priority: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Preferred Dates */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Preferred Dates & Times *</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addPreferredDate}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Time Slot
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {form.preferredDates.map((pref, index) => (
                                    <div key={index} className="flex items-end gap-3 p-3 border rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                            <div className="space-y-2">
                                                <Label htmlFor={`date-${index}`}>Date</Label>
                                                <Input
                                                    id={`date-${index}`}
                                                    type="date"
                                                    value={pref.date}
                                                    onChange={(e) => updatePreferredDate(index, 'date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`time-${index}`}>Time</Label>
                                                <Input
                                                    id={`time-${index}`}
                                                    type="time"
                                                    value={pref.time}
                                                    onChange={(e) => updatePreferredDate(index, 'time', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {form.preferredDates.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removePreferredDate(index)}
                                                className="text-red-600 mb-2"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Please provide at least 3 preferred time slots to increase the chances of scheduling.
                            </p>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-2">
                            <Label htmlFor="attachments">Attachments (Optional)</Label>
                            <Input
                                id="attachments"
                                type="file"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setForm(prev => ({
                                        ...prev,
                                        attachments: files.map(file => file.name)
                                    }));
                                }}
                            />
                            <p className="text-sm text-muted-foreground">
                                You can attach relevant documents, presentations, or briefs (max 3 files)
                            </p>
                        </div>

                        {/* Requestor Information */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 text-lg">Requestor Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                                    <div>
                                        <span className="font-medium">Name:</span> {user?.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Department:</span> {user?.department || 'Not specified'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Role:</span> {user?.role}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {user?.email}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Approval Process Info */}
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-900 text-lg">Approval Process</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-green-800">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>Your request will be reviewed by the Executive Assistant within 24 hours</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>You will receive a notification once a decision is made</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        <span>For urgent matters, please contact the Executive Assistant directly</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild disabled={saving}>
                                <Link href="/time">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Submit Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}