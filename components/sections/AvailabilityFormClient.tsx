'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { CEOAvailability } from '@/types/time-management';
import { timeManagementService } from '@/lib/api/time-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {ArrowLeft, Loader2, Save, Calendar, Clock, Plus, Trash2} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Props {
    mode: 'create' | 'edit';
    initialData?: CEOAvailability;
}

const AVAILABILITY_TYPES = [
    { value: 'available', label: 'Available', description: 'Open for meetings' },
    { value: 'limited', label: 'Limited Availability', description: 'Urgent matters only' },
    { value: 'unavailable', label: 'Unavailable', description: 'No meetings' },
    { value: 'traveling', label: 'Traveling', description: 'Business trip' },
    { value: 'strategic-block', label: 'Strategic Block', description: 'Focus time' }
];

export default function AvailabilityFormClient({ mode, initialData }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CEOAvailability>(
        initialData || {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            status: 'available',
            timeSlots: [{ startTime: '09:00', endTime: '17:00', type: 'available' }],
            location: 'Office',
            notes: '',
            updatedBy: user?.id || 'system',
            updatedAt: new Date().toISOString()
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.date) {
            toast.error('Please select a date');
            return;
        }

        setSaving(true);
        try {
            if (mode === 'create') {
                await timeManagementService.updateAvailability(form);
                toast.success('Availability created successfully!');
            } else {
                await timeManagementService.updateAvailability(form);
                toast.success('Availability updated successfully!');
            }
            router.push('/time/ceo-agenda');
        } catch (error) {
            toast.error(`Failed to ${mode} availability`);
        } finally {
            setSaving(false);
        }
    };

    const addTimeSlot = () => {
        setForm(prev => ({
            ...prev,
            timeSlots: [...prev.timeSlots, { startTime: '09:00', endTime: '17:00', type: 'available' }]
        }));
    };

    const removeTimeSlot = (index: number) => {
        setForm(prev => ({
            ...prev,
            timeSlots: prev.timeSlots.filter((_, i) => i !== index)
        }));
    };

    const updateTimeSlot = (index: number, field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            timeSlots: prev.timeSlots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
            )
        }));
    };

    const cancelHref = mode === 'create'
        ? '/time/ceo-agenda'
        : `/time/ceo-agenda/availability/${form.id}`;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {mode === 'create' ? 'Back to CEO Agenda' : 'Back to Availability'}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <Calendar className="h-8 w-8 mr-3" />
                    {mode === 'create' ? 'Add Availability' : `Edit Availability`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === 'create'
                        ? 'Set CEO availability for a specific date'
                        : 'Update CEO availability details'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Availability Details</CardTitle>
                        <CardDescription>
                            Set the CEO&#39;s availability and time blocks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Availability Status *</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(value: CEOAvailability['status']) =>
                                        setForm(prev => ({ ...prev, status: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABILITY_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex flex-col">
                                                    <span>{type.label}</span>
                                                    <span className="text-xs text-muted-foreground">{type.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={form.location}
                                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g., Office, Virtual, Home Office"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Time Slots</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Time Slot
                                </Button>
                            </div>

                            {form.timeSlots.map((slot, index) => (
                                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                        <div className="space-y-2">
                                            <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                                            <Input
                                                id={`startTime-${index}`}
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`endTime-${index}`}>End Time</Label>
                                            <Input
                                                id={`endTime-${index}`}
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`type-${index}`}>Slot Type</Label>
                                            <Select
                                                value={slot.type}
                                                onValueChange={(value) => updateTimeSlot(index, 'type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="available">Available</SelectItem>
                                                    <SelectItem value="limited">Limited</SelectItem>
                                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {form.timeSlots.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeTimeSlot(index)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={form.notes || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes or instructions..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild disabled={saving}>
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {mode === 'create' ? 'Create Availability' : 'Update Availability'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}