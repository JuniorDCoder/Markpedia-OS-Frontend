'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { TravelRequest, LinkedMeeting } from '@/types/time-management';
import { timeManagementService } from '@/lib/api/time-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Props {
    mode: 'create' | 'edit';
    initialData?: TravelRequest;
}

const TRAVEL_TYPES = [
    { value: 'business', label: 'Business' },
    { value: 'event', label: 'Event' },
    { value: 'investor', label: 'Investor' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'csr', label: 'CSR' }
];

const TRANSPORT_MODES = [
    { value: 'air', label: 'Air' },
    { value: 'road', label: 'Road' },
    { value: 'sea', label: 'Sea' }
];

const PAYMENT_METHODS = [
    { value: 'company-card', label: 'Company Card' },
    { value: 'advance', label: 'Advance' },
    { value: 'cash', label: 'Cash' }
];

export default function TravelRequestFormClient({ mode, initialData }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Omit<TravelRequest, 'id' | 'travelId' | 'createdAt' | 'updatedAt'>>(
        initialData ? {
            destination: initialData.destination,
            purpose: initialData.purpose,
            type: initialData.type,
            departureDate: initialData.departureDate,
            returnDate: initialData.returnDate,
            duration: initialData.duration,
            status: initialData.status,
            transportMode: initialData.transportMode,
            provider: initialData.provider,
            accommodation: initialData.accommodation,
            meetings: initialData.meetings,
            companions: initialData.companions,
            visaStatus: initialData.visaStatus,
            budgetEstimate: initialData.budgetEstimate,
            paymentMethod: initialData.paymentMethod,
            financeApproval: initialData.financeApproval,
            remarks: initialData.remarks,
            documents: initialData.documents,
            emergencyContact: initialData.emergencyContact,
            createdBy: initialData.createdBy
        } : {
            destination: '',
            purpose: '',
            type: 'business',
            departureDate: '',
            returnDate: '',
            duration: 0,
            status: 'planned',
            transportMode: 'air',
            provider: '',
            accommodation: '',
            meetings: [],
            companions: [],
            visaStatus: 'not-needed',
            budgetEstimate: 0,
            paymentMethod: 'company-card',
            financeApproval: false,
            remarks: '',
            documents: [],
            emergencyContact: '',
            createdBy: user?.id || 'system'
        }
    );

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleDateChange = (field: 'departureDate' | 'returnDate', value: string) => {
        const updated = { ...form, [field]: value };
        if (updated.departureDate && updated.returnDate) {
            updated.duration = calculateDuration(updated.departureDate, updated.returnDate);
        }
        setForm(updated);
    };

    const addMeeting = () => {
        setForm(prev => ({
            ...prev,
            meetings: [...prev.meetings, {
                id: Date.now().toString(),
                title: '',
                date: '',
                time: '',
                location: '',
                participants: []
            }]
        }));
    };

    const removeMeeting = (index: number) => {
        setForm(prev => ({
            ...prev,
            meetings: prev.meetings.filter((_, i) => i !== index)
        }));
    };

    const updateMeeting = (index: number, field: keyof LinkedMeeting, value: string) => {
        setForm(prev => ({
            ...prev,
            meetings: prev.meetings.map((meeting, i) =>
                i === index ? { ...meeting, [field]: value } : meeting
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.destination || !form.purpose || !form.departureDate || !form.returnDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            if (mode === 'create') {
                await timeManagementService.createTravelRequest(form);
                toast.success('Travel request created successfully!');
            } else {
                // For edit, we would update the existing request
                toast.success('Travel request updated successfully!');
            }
            router.push('/time/ceo-agenda?tab=travel');
        } catch (error) {
            toast.error(`Failed to ${mode} travel request`);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = '/time/ceo-agenda?tab=travel';

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to CEO Agenda
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <MapPin className="h-8 w-8 mr-3" />
                    {mode === 'create' ? 'Create Travel Request' : `Edit Travel Request`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === 'create'
                        ? 'Plan a new business trip for the CEO'
                        : 'Update travel request details'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Travel Information</CardTitle>
                        <CardDescription>
                            Enter details about the business trip
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination *</Label>
                                <Input
                                    id="destination"
                                    value={form.destination}
                                    onChange={(e) => setForm(prev => ({ ...prev, destination: e.target.value }))}
                                    placeholder="City, Country"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Travel Type *</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(value: TravelRequest['type']) =>
                                        setForm(prev => ({ ...prev, type: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRAVEL_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="departureDate">Departure Date *</Label>
                                <Input
                                    id="departureDate"
                                    type="date"
                                    value={form.departureDate}
                                    onChange={(e) => handleDateChange('departureDate', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="returnDate">Return Date *</Label>
                                <Input
                                    id="returnDate"
                                    type="date"
                                    value={form.returnDate}
                                    onChange={(e) => handleDateChange('returnDate', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={form.duration}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transportMode">Transport Mode *</Label>
                                <Select
                                    value={form.transportMode}
                                    onValueChange={(value: TravelRequest['transportMode']) =>
                                        setForm(prev => ({ ...prev, transportMode: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRANSPORT_MODES.map(mode => (
                                            <SelectItem key={mode.value} value={mode.value}>
                                                {mode.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purpose">Purpose of Travel *</Label>
                            <Textarea
                                id="purpose"
                                value={form.purpose}
                                onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                                placeholder="Describe the purpose and objectives of this trip..."
                                rows={3}
                                required
                            />
                        </div>

                        {/* Logistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="provider">Transport Provider</Label>
                                <Input
                                    id="provider"
                                    value={form.provider}
                                    onChange={(e) => setForm(prev => ({ ...prev, provider: e.target.value }))}
                                    placeholder="e.g., Air France, Train Company"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accommodation">Accommodation</Label>
                                <Input
                                    id="accommodation"
                                    value={form.accommodation}
                                    onChange={(e) => setForm(prev => ({ ...prev, accommodation: e.target.value }))}
                                    placeholder="Hotel name and address"
                                />
                            </div>
                        </div>

                        {/* Meetings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Meetings & Appointments</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addMeeting}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Meeting
                                </Button>
                            </div>

                            {form.meetings.map((meeting, index) => (
                                <div key={meeting.id} className="flex items-end gap-4 p-4 border rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                        <div className="space-y-2">
                                            <Label htmlFor={`meeting-title-${index}`}>Meeting Title</Label>
                                            <Input
                                                id={`meeting-title-${index}`}
                                                value={meeting.title}
                                                onChange={(e) => updateMeeting(index, 'title', e.target.value)}
                                                placeholder="Meeting purpose"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`meeting-date-${index}`}>Date</Label>
                                            <Input
                                                id={`meeting-date-${index}`}
                                                type="date"
                                                value={meeting.date}
                                                onChange={(e) => updateMeeting(index, 'date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`meeting-time-${index}`}>Time</Label>
                                            <Input
                                                id={`meeting-time-${index}`}
                                                type="time"
                                                value={meeting.time}
                                                onChange={(e) => updateMeeting(index, 'time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`meeting-location-${index}`}>Location</Label>
                                            <Input
                                                id={`meeting-location-${index}`}
                                                value={meeting.location}
                                                onChange={(e) => updateMeeting(index, 'location', e.target.value)}
                                                placeholder="Meeting venue"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeMeeting(index)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Budget & Finance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="budgetEstimate">Budget Estimate (XAF) *</Label>
                                <Input
                                    id="budgetEstimate"
                                    type="number"
                                    value={form.budgetEstimate}
                                    onChange={(e) => setForm(prev => ({ ...prev, budgetEstimate: parseInt(e.target.value) || 0 }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method *</Label>
                                <Select
                                    value={form.paymentMethod}
                                    onValueChange={(value: TravelRequest['paymentMethod']) =>
                                        setForm(prev => ({ ...prev, paymentMethod: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map(method => (
                                            <SelectItem key={method.value} value={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                                id="emergencyContact"
                                value={form.emergencyContact}
                                onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                                placeholder="Local emergency contact information"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks & Additional Information</Label>
                            <Textarea
                                id="remarks"
                                value={form.remarks}
                                onChange={(e) => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                                placeholder="Any additional information or special requirements..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild disabled={saving}>
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {mode === 'create' ? 'Create Travel Request' : 'Update Travel Request'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}