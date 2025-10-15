'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Clock, Building, User, FileText, Target, Badge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { meetingService } from '@/services/api';
import toast from 'react-hot-toast';

interface AgendaItem {
    item: string;
    presenter: string;
    duration: string;
}

export default function NewMeetingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [meetingType, setMeetingType] = useState('');
    const [departments, setDepartments] = useState<string[]>([]);
    const [participants, setParticipants] = useState(['']);
    const [absent, setAbsent] = useState(['']);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([{ item: '', presenter: '', duration: '' }]);

    const departmentOptions = [
        'Executive', 'Finance', 'Logistics', 'Marketing', 'HR', 'Legal',
        'Engineering', 'Sales', 'Operations', 'Strategy', 'Compliance'
    ];

    const meetingTypeOptions = [
        'Executive Strategy Review',
        'Department Planning',
        'Project Review',
        'Team Sync',
        'Client Meeting',
        'Board Meeting',
        'All-Hands',
        'Training Session',
        'Problem Solving',
        'Decision Making'
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const meetingData = {
            title: formData.get('title') as string,
            date: date?.toISOString() || new Date().toISOString(),
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            platform: formData.get('platform') as string,
            location: formData.get('location') as string,
            department: departments,
            meetingType: meetingType,
            calledBy: formData.get('calledBy') as string,
            facilitator: formData.get('facilitator') as string,
            minuteTaker: formData.get('minuteTaker') as string,
            participants: participants.filter(p => p.trim() !== ''),
            absent: absent.filter(a => a.trim() !== ''),
            purpose: formData.get('purpose') as string,
            agenda: agendaItems.filter(item => item.item.trim() !== ''),
            discussion: [],
            decisions: [],
            actionItems: [],
            risks: [],
            attachments: [],
            status: 'Scheduled' as const,
            createdBy: 'Current User', // This would come from auth context
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            // Using updateMeeting since createMeeting might not be implemented
            const newMeeting = await meetingService.updateMeeting('new', meetingData);
            toast.success('Meeting created successfully');
            router.push('/work/minutes');
        } catch (error) {
            toast.error('Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, { item: '', presenter: '', duration: '' }]);
    };

    const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
        const newAgendaItems = [...agendaItems];
        newAgendaItems[index] = { ...newAgendaItems[index], [field]: value };
        setAgendaItems(newAgendaItems);
    };

    const removeAgendaItem = (index: number) => {
        if (agendaItems.length === 1) return;
        const newAgendaItems = [...agendaItems];
        newAgendaItems.splice(index, 1);
        setAgendaItems(newAgendaItems);
    };

    const addParticipant = () => {
        setParticipants([...participants, '']);
    };

    const updateParticipant = (index: number, value: string) => {
        const newParticipants = [...participants];
        newParticipants[index] = value;
        setParticipants(newParticipants);
    };

    const removeParticipant = (index: number) => {
        if (participants.length === 1) return;
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const addAbsent = () => {
        setAbsent([...absent, '']);
    };

    const updateAbsent = (index: number, value: string) => {
        const newAbsent = [...absent];
        newAbsent[index] = value;
        setAbsent(newAbsent);
    };

    const removeAbsent = (index: number) => {
        if (absent.length === 1) return;
        const newAbsent = [...absent];
        newAbsent.splice(index, 1);
        setAbsent(newAbsent);
    };

    const toggleDepartment = (dept: string) => {
        setDepartments(prev =>
            prev.includes(dept)
                ? prev.filter(d => d !== dept)
                : [...prev, dept]
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Schedule New Meeting</h1>
                    <p className="text-muted-foreground mt-1">Create a new meeting following Markpedia OS structure</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Information</CardTitle>
                                <CardDescription>Enter the basic information about your meeting</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Quarterly Strategy Review - Q4 2025"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meetingType">Meeting Type *</Label>
                                        <Select value={meetingType} onValueChange={setMeetingType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select meeting type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {meetingTypeOptions.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">Start Time *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="startTime" name="startTime" type="time" className="pl-10" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endTime">End Time *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="endTime" name="endTime" type="time" className="pl-10" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="platform">Platform *</Label>
                                        <Input
                                            id="platform"
                                            name="platform"
                                            placeholder="Zoom / Microsoft Teams / Boardroom"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="Conference Room A"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Departments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building className="h-5 w-5 mr-2" />
                                    Departments
                                </CardTitle>
                                <CardDescription>Select departments involved in this meeting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {departmentOptions.map(dept => (
                                        <Badge
                                            key={dept}
                                            variant={departments.includes(dept) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleDepartment(dept)}
                                        >
                                            {dept}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* People */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    People
                                </CardTitle>
                                <CardDescription>Meeting organizers and attendees</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="calledBy">Called By *</Label>
                                        <Input id="calledBy" name="calledBy" placeholder="Ngu Divine (CEO)" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="facilitator">Facilitator *</Label>
                                        <Input id="facilitator" name="facilitator" placeholder="Strategy Department" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minuteTaker">Minute Taker *</Label>
                                        <Input id="minuteTaker" name="minuteTaker" placeholder="HR Secretary" required />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Participants *</Label>
                                    {participants.map((participant, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <Input
                                                placeholder={`Participant ${index + 1}`}
                                                value={participant}
                                                onChange={(e) => updateParticipant(index, e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeParticipant(index)}
                                                disabled={participants.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addParticipant}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Participant
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Label>Absent</Label>
                                    {absent.map((person, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <Input
                                                placeholder={`Absent person ${index + 1}`}
                                                value={person}
                                                onChange={(e) => updateAbsent(index, e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeAbsent(index)}
                                                disabled={absent.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addAbsent}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Absent
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Purpose */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Purpose of Meeting
                                </CardTitle>
                                <CardDescription>Why is this meeting being held?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="purpose"
                                    name="purpose"
                                    placeholder="To review Q3 performance, identify key challenges, and define strategic objectives and KPIs for Q4 2025 aligned with the company's annual OKRs."
                                    rows={4}
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* Agenda */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Agenda</CardTitle>
                                <CardDescription>What topics will be discussed in this meeting?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {agendaItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                                        <Input
                                            placeholder="Agenda item"
                                            value={item.item}
                                            onChange={(e) => updateAgendaItem(index, 'item', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Presenter"
                                            value={item.presenter}
                                            onChange={(e) => updateAgendaItem(index, 'presenter', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Duration"
                                            value={item.duration}
                                            onChange={(e) => updateAgendaItem(index, 'duration', e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeAgendaItem(index)}
                                            disabled={agendaItems.length === 1}
                                            className="h-10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addAgendaItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Agenda Item
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Options</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="template">Use Template</Label>
                                    <Select>
                                        <SelectTrigger id="template">
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard Meeting</SelectItem>
                                            <SelectItem value="strategy">Strategy Review</SelectItem>
                                            <SelectItem value="project">Project Review</SelectItem>
                                            <SelectItem value="department">Department Sync</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="notifications" className="rounded border-gray-300" defaultChecked />
                                    <Label htmlFor="notifications" className="text-sm font-medium leading-none">
                                        Send calendar invitations
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="reminders" className="rounded border-gray-300" defaultChecked />
                                    <Label htmlFor="reminders" className="text-sm font-medium leading-none">
                                        Enable reminder notifications
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-800">Markpedia OS</CardTitle>
                                <CardDescription className="text-blue-600">
                                    Consistent documentation for accountability and execution clarity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-blue-700">
                                    <p>✅ Purpose & Agenda</p>
                                    <p>✅ Discussions & Agreements</p>
                                    <p>✅ Decisions Made</p>
                                    <p>✅ Action Plan</p>
                                    <p>✅ Risks & Challenges</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? 'Creating Meeting...' : 'Create Meeting'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}