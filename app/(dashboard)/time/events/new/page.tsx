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
import { ArrowLeft, Loader2, Plus, Calendar, Users, DollarSign, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewEventPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        type: 'corporate' as 'corporate' | 'recognition' | 'team-building' | 'training' | 'innovation' | 'social' | 'csr',
        organizer: '',
        startDate: '',
        endDate: '',
        venue: '',
        departments: [] as string[],
        budgetEstimate: 0,
        objective: '',
        agenda: '',
        speakers: [] as string[],
        attachments: [] as string[],
        visibility: 'company-wide' as 'company-wide' | 'departmental'
    });

    const EVENT_TYPES = [
        { value: 'corporate', label: 'Corporate Event', description: 'Town halls, strategy reviews, investor summits' },
        { value: 'recognition', label: 'Recognition Event', description: 'Award ceremonies, achievement celebrations' },
        { value: 'team-building', label: 'Team Building', description: 'Departmental retreats, games, wellness days' },
        { value: 'training', label: 'Training & Development', description: 'Workshops, webinars, learning programs' },
        { value: 'innovation', label: 'Innovation Event', description: 'Hackathons, product demos, innovation week' },
        { value: 'social', label: 'Social Event', description: 'Birthdays, anniversaries, festive celebrations' },
        { value: 'csr', label: 'CSR Event', description: 'Community outreach, volunteer programs' }
    ];

    const DEPARTMENTS = [
        'Tech', 'Product', 'Marketing', 'Sales', 'HR', 'Finance',
        'Operations', 'Logistics', 'Customer Support', 'R&D'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to create an event');
            return;
        }

        // Validate required fields
        if (!form.title || !form.startDate || !form.endDate || !form.venue || !form.objective) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (new Date(form.startDate) > new Date(form.endDate)) {
            toast.error('End date cannot be before start date');
            return;
        }

        setSaving(true);
        try {
            await timeManagementService.createCompanyEvent({
                ...form,
                organizer: user.department || 'General',
                status: 'planned',
                archived: false
            });

            toast.success('Event created successfully!');
            router.push('/time?tab=events');
        } catch (error) {
            toast.error('Failed to create event');
        } finally {
            setSaving(false);
        }
    };

    const addSpeaker = () => {
        setForm(prev => ({
            ...prev,
            speakers: [...prev.speakers, '']
        }));
    };

    const removeSpeaker = (index: number) => {
        setForm(prev => ({
            ...prev,
            speakers: prev.speakers.filter((_, i) => i !== index)
        }));
    };

    const updateSpeaker = (index: number, value: string) => {
        setForm(prev => ({
            ...prev,
            speakers: prev.speakers.map((speaker, i) => i === index ? value : speaker)
        }));
    };

    const toggleDepartment = (department: string) => {
        setForm(prev => ({
            ...prev,
            departments: prev.departments.includes(department)
                ? prev.departments.filter(d => d !== department)
                : [...prev.departments, department]
        }));
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
                    Create Company Event
                </h1>
                <p className="text-muted-foreground mt-2">
                    Plan and organize a new company event for employees
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Information</CardTitle>
                        <CardDescription>
                            Provide details about the company event you're planning
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Markpedia Innovation Day 2025"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type *</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_TYPES.map(type => (
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
                                <Label htmlFor="startDate">Start Date & Time *</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={form.startDate}
                                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date & Time *</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={form.endDate}
                                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="venue">Venue / Platform *</Label>
                            <Input
                                id="venue"
                                value={form.venue}
                                onChange={(e) => setForm(prev => ({ ...prev, venue: e.target.value }))}
                                placeholder="e.g., Main Conference Hall, Zoom Meeting, etc."
                                required
                            />
                        </div>

                        {/* Departments */}
                        <div className="space-y-2">
                            <Label>Departments Involved *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {DEPARTMENTS.map(dept => (
                                    <Button
                                        key={dept}
                                        type="button"
                                        variant={form.departments.includes(dept) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleDepartment(dept)}
                                        className="justify-start"
                                    >
                                        {form.departments.includes(dept) && <Plus className="h-3 w-3 mr-1" />}
                                        {dept}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                            <Label htmlFor="budgetEstimate">Budget Estimate (XAF)</Label>
                            <Input
                                id="budgetEstimate"
                                type="number"
                                value={form.budgetEstimate}
                                onChange={(e) => setForm(prev => ({ ...prev, budgetEstimate: parseInt(e.target.value) || 0 }))}
                                placeholder="Estimated budget for the event"
                            />
                        </div>

                        {/* Objective */}
                        <div className="space-y-2">
                            <Label htmlFor="objective">Objective & Purpose *</Label>
                            <Textarea
                                id="objective"
                                value={form.objective}
                                onChange={(e) => setForm(prev => ({ ...prev, objective: e.target.value }))}
                                placeholder="Describe the purpose and desired outcomes of this event..."
                                rows={3}
                                required
                            />
                        </div>

                        {/* Agenda */}
                        <div className="space-y-2">
                            <Label htmlFor="agenda">Agenda Outline</Label>
                            <Textarea
                                id="agenda"
                                value={form.agenda}
                                onChange={(e) => setForm(prev => ({ ...prev, agenda: e.target.value }))}
                                placeholder="Outline the event schedule, sessions, and activities..."
                                rows={4}
                            />
                        </div>

                        {/* Speakers */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Guest Speakers / Presenters</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Speaker
                                </Button>
                            </div>

                            {form.speakers.map((speaker, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        value={speaker}
                                        onChange={(e) => updateSpeaker(index, e.target.value)}
                                        placeholder="Speaker name and role"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSpeaker(index)}
                                        className="text-red-600"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Visibility */}
                        <div className="space-y-2">
                            <Label>Event Visibility *</Label>
                            <Select
                                value={form.visibility}
                                onValueChange={(value: 'company-wide' | 'departmental') =>
                                    setForm(prev => ({ ...prev, visibility: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company-wide">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Company-wide
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="departmental">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Departmental Only
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Attachments */}
                        <div className="space-y-2">
                            <Label htmlFor="attachments">Supporting Documents</Label>
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
                                You can attach flyers, presentations, or other relevant documents
                            </p>
                        </div>

                        {/* Approval Info */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 text-lg">Approval Process</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        <span>This event will be submitted for HR and management approval</span>
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        <span>Events with budgets over 1,000,000 XAF require CEO approval</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>Once approved, the event will be added to the company calendar</span>
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
                                Create Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}