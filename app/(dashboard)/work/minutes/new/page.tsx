'use client';

import {useState, useEffect, useMemo} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import {
    CalendarIcon,
    Plus,
    X,
    Clock,
    Building,
    User,
    FileText,
    Target,
    Badge,
    Download,
    Trash2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { meetingService } from '@/services/api';
import { AgendaItem } from '@/types';
import toast from 'react-hot-toast';
import {departmentsApi} from "@/lib/api/departments";
import {useAuthStore} from "@/store/auth";
import { Check, ChevronsUpDown, Search } from 'lucide-react';

// Template data
const meetingTemplates = {
    strategy: {
        title: "Quarterly Strategy Review - Q4 2025",
        purpose: "To review Q3 performance, identify key challenges, and define strategic objectives and KPIs for Q4 2025 aligned with the company's annual OKRs.",
        agenda: [
            { topic: "Q3 Performance Review", presenter: "CEO", duration: "30 min", notes: "Review key metrics and achievements" },
            { topic: "Market Analysis & Trends", presenter: "Strategy Team", duration: "25 min", notes: "Current market conditions and opportunities" },
            { topic: "Q4 Strategic Objectives", presenter: "Department Heads", duration: "45 min", notes: "Define key priorities and initiatives" },
            { topic: "Budget & Resource Allocation", presenter: "Finance", duration: "20 min", notes: "Review and approve Q4 budget" }
        ],
        departments: [],
        meetingType: "Executive Strategy Review"
    },
    project: {
        title: "Project Kick-off Meeting - New Platform",
        purpose: "To align all stakeholders on project goals, timelines, responsibilities, and success metrics for the new platform implementation.",
        agenda: [
            { topic: "Project Overview & Goals", presenter: "Project Manager", duration: "20 min", notes: "Project vision and objectives" },
            { topic: "Scope & Deliverables", presenter: "Tech Lead", duration: "30 min", notes: "Detailed scope and timeline" },
            { topic: "Team Roles & Responsibilities", presenter: "HR", duration: "25 min", notes: "Define team structure" },
            { topic: "Risk Assessment", presenter: "All", duration: "15 min", notes: "Identify potential risks" }
        ],
        departments: [],
        meetingType: "Project Review"
    },
    department: {
        title: "Department Monthly Sync - Marketing",
        purpose: "Review monthly performance, coordinate cross-functional initiatives, and align on upcoming campaigns and priorities.",
        agenda: [
            { topic: "Monthly Performance Review", presenter: "Department Head", duration: "25 min", notes: "KPI review and analysis" },
            { topic: "Upcoming Campaigns", presenter: "Campaign Manager", duration: "30 min", notes: "Q4 campaign planning" },
            { topic: "Cross-functional Coordination", presenter: "Team Leads", duration: "20 min", notes: "Alignment with other departments" },
            { topic: "Resource Needs", presenter: "All", duration: "15 min", notes: "Discuss resource requirements" }
        ],
        departments: [],
        meetingType: "Department Planning"
    }
};

export default function NewMeetingPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [meetingType, setMeetingType] = useState('');
    const [departments, setDepartments] = useState<string[]>([]);
    const [participants, setParticipants] = useState(['']);
    const [absent, setAbsent] = useState(['']);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
        {
            id: `agenda-${Date.now()}-0`,
            topic: '',
            presenter: '',
            duration: '',
            notes: ''
        }
    ]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const currentUserName = useMemo(() => {
        const first = user?.firstName || '';
        const last = user?.lastName || '';
        return `${first} ${last}`.trim() || user?.email || '';
    }, [user]);
    const [calledBy, setCalledBy] = useState(currentUserName);

    // Fetch available departments from API
    useEffect(() => {
        // Mock departments - replace with actual API call
        const fetchDepartments = async () => {
            try {
                const fetchedDepartments = await departmentsApi.getNames()

                setAvailableDepartments(fetchedDepartments);
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };

        fetchDepartments();
    }, []);

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
            date: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            start_time: formData.get('startTime') as string,
            end_time: formData.get('endTime') as string,
            platform: formData.get('platform') as string,
            location: formData.get('location') as string,
            department: departments,
            meeting_type: meetingType,
            called_by: calledBy,
            facilitator: formData.get('facilitator') as string,
            minute_taker: formData.get('minuteTaker') as string,
            participants: participants.filter(p => p.trim() !== ''),
            absent: absent.filter(a => a.trim() !== ''),
            purpose: formData.get('purpose') as string,
            agenda: agendaItems.filter(item => item.topic.trim() !== ''),
            discussion: [],
            decisions: [],
            action_items: [],
            risks: [],
            attachments: [],
            status: 'Scheduled' as const,
            created_by: currentUserName,
            // Add timestamp fields to match your project structure
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        console.log('Submitting meeting data:', meetingData); // Debug log

        try {
            await meetingService.createMeeting(meetingData);
            toast.success('Meeting created successfully');
            router.push('/work/minutes');
        } catch (error) {
            console.error('Failed to create meeting:', error);
            toast.error('Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    const applyTemplate = (templateKey: keyof typeof meetingTemplates) => {
        const template = meetingTemplates[templateKey];

        // Set basic fields
        const titleInput = document.getElementById('title') as HTMLInputElement;
        const purposeInput = document.getElementById('purpose') as HTMLTextAreaElement;

        if (titleInput) titleInput.value = template.title;
        if (purposeInput) purposeInput.value = template.purpose;

        // Set meeting type
        setMeetingType(template.meetingType);

        // Set departments
        setDepartments(template.departments);

        // Set agenda items
        const newAgendaItems = template.agenda.map((item, index) => ({
            id: `agenda-${Date.now()}-${index}`,
            topic: item.topic,
            presenter: item.presenter,
            duration: item.duration,
            notes: item.notes
        }));
        setAgendaItems(newAgendaItems);

        // Set current date and time
        setDate(new Date());

        // Set default times
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement;
        const endTimeInput = document.getElementById('endTime') as HTMLInputElement;
        if (startTimeInput) startTimeInput.value = '09:00';
        if (endTimeInput) endTimeInput.value = '10:30';

        // Set default platform and location
        const platformInput = document.getElementById('platform') as HTMLInputElement;
        const locationInput = document.getElementById('location') as HTMLInputElement;
        if (platformInput) platformInput.value = 'Microsoft Teams';
        if (locationInput) locationInput.value = 'Virtual Meeting';

        // Set default people
        const calledByInput = document.getElementById('calledBy') as HTMLInputElement;
        const facilitatorInput = document.getElementById('facilitator') as HTMLInputElement;
        const minuteTakerInput = document.getElementById('minuteTaker') as HTMLInputElement;

        if (calledByInput) calledByInput.value = 'Department Head';
        if (facilitatorInput) facilitatorInput.value = 'Meeting Coordinator';
        if (minuteTakerInput) minuteTakerInput.value = 'Team Assistant';

        // Set default participants
        setParticipants(['Team Member 1', 'Team Member 2', 'Team Member 3']);

        toast.success(`Applied ${templateKey} template`);
    };

    const clearForm = () => {
        // Reset all form fields
        const form = document.querySelector('form');
        if (form) form.reset();

        setDate(undefined);
        setMeetingType('');
        setDepartments([]);
        setParticipants(['']);
        setAbsent(['']);
        setAgendaItems([{
            id: `agenda-${Date.now()}-0`,
            topic: '',
            presenter: '',
            duration: '',
            notes: ''
        }]);
        setSelectedTemplate('');

        toast.success('Form cleared');
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, {
            id: `agenda-${Date.now()}-${agendaItems.length}`,
            topic: '',
            presenter: '',
            duration: '',
            notes: ''
        }]);
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

    const selectAllDepartments = () => {
        setDepartments([...availableDepartments]);
    };

    const clearDepartments = () => {
        setDepartments([]);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Schedule New Meeting</h1>
                    <p className="text-muted-foreground mt-1">Create a new meeting following Markpedia OS structure</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={clearForm}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Form
                    </Button>
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Template Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Quick Start Templates
                    </CardTitle>
                    <CardDescription>Choose a template to pre-fill the form with common meeting structures</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card
                            className={cn(
                                "cursor-pointer transition-all hover:border-blue-500 hover:shadow-md",
                                selectedTemplate === 'strategy' && "border-blue-500 bg-blue-50"
                            )}
                            onClick={() => {
                                setSelectedTemplate('strategy');
                                applyTemplate('strategy');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-blue-600" />
                                    <h3 className="font-semibold">Strategy Review</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Quarterly performance review and strategic planning
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className={cn(
                                "cursor-pointer transition-all hover:border-green-500 hover:shadow-md",
                                selectedTemplate === 'project' && "border-green-500 bg-green-50"
                            )}
                            onClick={() => {
                                setSelectedTemplate('project');
                                applyTemplate('project');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <h3 className="font-semibold">Project Kick-off</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    New project initiation with scope and team alignment
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className={cn(
                                "cursor-pointer transition-all hover:border-purple-500 hover:shadow-md",
                                selectedTemplate === 'department' && "border-purple-500 bg-purple-50"
                            )}
                            onClick={() => {
                                setSelectedTemplate('department');
                                applyTemplate('department');
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building className="h-4 w-4 text-purple-600" />
                                    <h3 className="font-semibold">Department Sync</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Monthly department performance review and coordination
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

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
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Building className="h-5 w-5 mr-2" />
                                        Departments
                                        <Badge variant="secondary" className="ml-2">
                                            {departments.length} selected
                                        </Badge>
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={selectAllDepartments}>
                                            Select All
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={clearDepartments}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>Select departments involved in this meeting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Multi-select with search */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center">
                                                <Search className="h-4 w-4 mr-2" />
                                                {departments.length === 0
                                                    ? "Select departments..."
                                                    : `${departments.length} department(s) selected`
                                                }
                                            </div>
                                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <div className="max-h-60 overflow-auto">
                                            {/* Search input */}
                                            <div className="p-2 border-b">
                                                <Input
                                                    placeholder="Search departments..."
                                                    className="h-9"
                                                    onChange={(e) => {
                                                        const searchTerm = e.target.value.toLowerCase();
                                                        // We'll filter in the map below
                                                    }}
                                                />
                                            </div>

                                            {/* Department list */}
                                            <div className="p-1">
                                                {availableDepartments.map((dept) => (
                                                    <div
                                                        key={dept}
                                                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                                        onClick={() => toggleDepartment(dept)}
                                                    >
                                                        <div className={cn(
                                                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            departments.includes(dept)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "opacity-50"
                                                        )}>
                                                            {departments.includes(dept) && (
                                                                <Check className="h-3 w-3" />
                                                            )}
                                                        </div>
                                                        <Label className="flex-1 cursor-pointer text-sm font-normal">
                                                            {dept}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Selected departments display */}
                                {departments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <Label>Selected Departments:</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {departments.map((dept) => (
                                                <Badge
                                                    key={dept}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 px-2 py-1"
                                                >
                                                    {dept}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={() => toggleDepartment(dept)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                        <Input
                                            id="calledBy"
                                            name="calledBy"
                                            placeholder="Ngu Divine (CEO)"
                                            value={calledBy}
                                            onChange={(e) => setCalledBy(e.target.value)}
                                            required
                                        />
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
                                    <div className="flex items-center justify-between">
                                        <Label>Participants *</Label>
                                        <Badge variant="secondary">{participants.filter(p => p.trim()).length} participants</Badge>
                                    </div>
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
                                <div className="flex items-center justify-between">
                                    <CardTitle>Agenda</CardTitle>
                                    <Badge variant="secondary">{agendaItems.filter(item => item.topic.trim()).length} items</Badge>
                                </div>
                                <CardDescription>What topics will be discussed in this meeting?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {agendaItems.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                                        <div className="md:col-span-4">
                                            <Input
                                                placeholder="Agenda topic"
                                                value={item.topic}
                                                onChange={(e) => updateAgendaItem(index, 'topic', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Input
                                                placeholder="Presenter"
                                                value={item.presenter}
                                                onChange={(e) => updateAgendaItem(index, 'presenter', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Input
                                                placeholder="Duration"
                                                value={item.duration}
                                                onChange={(e) => updateAgendaItem(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeAgendaItem(index)}
                                                disabled={agendaItems.length === 1}
                                                className="h-10 w-full"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="md:col-span-12">
                                            <Input
                                                placeholder="Additional notes (optional)"
                                                value={item.notes || ''}
                                                onChange={(e) => updateAgendaItem(index, 'notes', e.target.value)}
                                            />
                                        </div>
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="notifications" defaultChecked />
                                    <Label htmlFor="notifications" className="text-sm font-medium leading-none cursor-pointer">
                                        Send calendar invitations
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="reminders" defaultChecked />
                                    <Label htmlFor="reminders" className="text-sm font-medium leading-none cursor-pointer">
                                        Enable reminder notifications
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="autoTasks" />
                                    <Label htmlFor="autoTasks" className="text-sm font-medium leading-none cursor-pointer">
                                        Auto-create action items as tasks
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
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Meeting...
                                </>
                            ) : (
                                'Create Meeting'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}