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
import { CalendarIcon, Plus, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { meetingService } from '@/services/api';
import toast from 'react-hot-toast';

export default function NewMeetingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [agendaItems, setAgendaItems] = useState(['']);
    const [attendees, setAttendees] = useState(['']);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const meetingData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            date: date?.toISOString() || new Date().toISOString(),
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            location: formData.get('location') as string,
            agenda: agendaItems.filter(item => item.trim() !== ''),
            attendees: attendees.filter(attendee => attendee.trim() !== ''),
        };

        try {
            await meetingService.createMeeting(meetingData);
            toast.success('Meeting created successfully');
            router.push('/work/minutes');
        } catch (error) {
            toast.error('Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, '']);
    };

    const updateAgendaItem = (index: number, value: string) => {
        const newAgendaItems = [...agendaItems];
        newAgendaItems[index] = value;
        setAgendaItems(newAgendaItems);
    };

    const removeAgendaItem = (index: number) => {
        if (agendaItems.length === 1) return;
        const newAgendaItems = [...agendaItems];
        newAgendaItems.splice(index, 1);
        setAgendaItems(newAgendaItems);
    };

    const addAttendee = () => {
        setAttendees([...attendees, '']);
    };

    const updateAttendee = (index: number, value: string) => {
        const newAttendees = [...attendees];
        newAttendees[index] = value;
        setAttendees(newAttendees);
    };

    const removeAttendee = (index: number) => {
        if (attendees.length === 1) return;
        const newAttendees = [...attendees];
        newAttendees.splice(index, 1);
        setAttendees(newAttendees);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Schedule New Meeting</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Details</CardTitle>
                                <CardDescription>Enter the basic information about your meeting</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input id="title" name="title" placeholder="Team weekly sync" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="What is this meeting about?"
                                        rows={3}
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
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" name="location" placeholder="Conference Room A or Zoom" />
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Agenda</CardTitle>
                                <CardDescription>What topics will be discussed in this meeting?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {agendaItems.map((item, index) => (
                                    <div key={index} className="flex space-x-2">
                                        <Input
                                            placeholder={`Agenda item ${index + 1}`}
                                            value={item}
                                            onChange={(e) => updateAgendaItem(index, e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeAgendaItem(index)}
                                            disabled={agendaItems.length === 1}
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

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendees</CardTitle>
                                <CardDescription>Who should attend this meeting?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {attendees.map((attendee, index) => (
                                    <div key={index} className="flex space-x-2">
                                        <Input
                                            placeholder={`Attendee ${index + 1}`}
                                            value={attendee}
                                            onChange={(e) => updateAttendee(index, e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeAttendee(index)}
                                            disabled={attendees.length === 1}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addAttendee}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Attendee
                                </Button>
                            </CardContent>
                        </Card>

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
                                            <SelectItem value="brainstorming">Brainstorming Session</SelectItem>
                                            <SelectItem value="review">Project Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="record" className="rounded border-gray-300" />
                                    <Label htmlFor="record" className="text-sm font-medium leading-none">
                                        Record this meeting
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="otter-integration" className="rounded border-gray-300" defaultChecked />
                                    <Label htmlFor="otter-integration" className="text-sm font-medium leading-none">
                                        Use Otter AI integration
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Schedule Meeting'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}