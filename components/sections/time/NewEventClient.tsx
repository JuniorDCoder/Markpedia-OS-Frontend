'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/chat';
import { Attendee } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewEventClientProps {
    currentUser: User;
    attendees: Attendee[];
}

export default function NewEventClient({ currentUser, attendees }: NewEventClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        type: 'Meeting' as const,
        location: '',
        isAllDay: false,
        isRecurring: false,
        recurrenceRule: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAttendeeToggle = (attendeeId: string) => {
        setSelectedAttendees(prev =>
            prev.includes(attendeeId)
                ? prev.filter(id => id !== attendeeId)
                : [...prev, attendeeId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate form
            if (!formData.title.trim()) {
                toast.error('Event title is required');
                return;
            }

            if (!formData.startDate || !formData.endDate) {
                toast.error('Start and end dates are required');
                return;
            }

            if (!formData.isAllDay && (!formData.startTime || !formData.endTime)) {
                toast.error('Start and end times are required for non-all-day events');
                return;
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Event created successfully');
            router.push('/time');
        } catch (error) {
            toast.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const eventTypes = [
        { value: 'Meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-800' },
        { value: 'Training', label: 'Training', color: 'bg-green-100 text-green-800' },
        { value: 'Holiday', label: 'Holiday', color: 'bg-red-100 text-red-800' },
        { value: 'Deadline', label: 'Deadline', color: 'bg-orange-100 text-orange-800' },
        { value: 'All-Hands', label: 'All-Hands', color: 'bg-purple-100 text-purple-800' },
        { value: 'Personal', label: 'Personal', color: 'bg-gray-100 text-gray-800' },
        { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
    ];

    const recurrenceOptions = [
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'YEARLY', label: 'Yearly' }
    ];

    return (
        <div className="min-h-screen bg-gray-50/30 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                    <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 p-0 sm:px-3 sm:py-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Back</span>
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                                Create New Event
                            </h1>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">
                                Schedule meetings, deadlines, and important dates
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 sm:flex-none sm:px-6 text-sm"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 sm:flex-none sm:px-6 text-sm"
                            size="sm"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                                    <span className="hidden sm:inline">Creating...</span>
                                    <span className="sm:hidden">Save</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Create Event</span>
                                    <span className="sm:hidden">Create</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Main Form - Full width on mobile, 2/3 on desktop */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Basic Information */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Event Details</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Enter the basic information about your event
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">
                                            Event Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="Enter event title"
                                            className="text-sm sm:text-base h-10 sm:h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Enter event description"
                                            rows={3}
                                            className="text-sm sm:text-base resize-none min-h-[80px]"
                                        />
                                    </div>

                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-sm font-medium">
                                                Event Type
                                            </Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value: any) => handleInputChange('type', value)}
                                            >
                                                <SelectTrigger className="text-sm sm:text-base h-10 sm:h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventTypes.map(type => (
                                                        <SelectItem key={type.value} value={type.value} className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className={`text-xs ${type.color}`}>
                                                                    {type.label}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-sm font-medium">
                                                Location
                                            </Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                placeholder="Enter location"
                                                className="text-sm sm:text-base h-10 sm:h-11"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Date & Time */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center text-base sm:text-lg lg:text-xl">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Date & Time
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Set when your event starts and ends
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isAllDay"
                                            checked={formData.isAllDay}
                                            onCheckedChange={(checked) => handleInputChange('isAllDay', checked)}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="isAllDay" className="text-sm font-medium cursor-pointer">
                                            All day event
                                        </Label>
                                    </div>

                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate" className="text-sm font-medium">
                                                Start Date *
                                            </Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                                className="text-sm sm:text-base h-10 sm:h-11"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="endDate" className="text-sm font-medium">
                                                End Date *
                                            </Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                                className="text-sm sm:text-base h-10 sm:h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {!formData.isAllDay && (
                                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="startTime" className="text-sm font-medium">
                                                    Start Time *
                                                </Label>
                                                <Input
                                                    id="startTime"
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                                    className="text-sm sm:text-base h-10 sm:h-11"
                                                    required={!formData.isAllDay}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="endTime" className="text-sm font-medium">
                                                    End Time *
                                                </Label>
                                                <Input
                                                    id="endTime"
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                                    className="text-sm sm:text-base h-10 sm:h-11"
                                                    required={!formData.isAllDay}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isRecurring"
                                            checked={formData.isRecurring}
                                            onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="isRecurring" className="text-sm font-medium cursor-pointer">
                                            Recurring event
                                        </Label>
                                    </div>

                                    {formData.isRecurring && (
                                        <div className="space-y-2">
                                            <Label htmlFor="recurrenceRule" className="text-sm font-medium">
                                                Repeat Every
                                            </Label>
                                            <Select
                                                value={formData.recurrenceRule}
                                                onValueChange={(value) => handleInputChange('recurrenceRule', value)}
                                            >
                                                <SelectTrigger className="text-sm sm:text-base h-10 sm:h-11">
                                                    <SelectValue placeholder="Select recurrence" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {recurrenceOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value} className="text-sm">
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Full width on mobile, 1/3 on desktop */}
                        <div className="space-y-4">
                            {/* Attendees */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center text-base sm:text-lg lg:text-xl">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Attendees
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Select people to invite
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                        {attendees.map(attendee => (
                                            <div
                                                key={attendee.id}
                                                className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => handleAttendeeToggle(attendee.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedAttendees.includes(attendee.id)}
                                                    onCheckedChange={() => handleAttendeeToggle(attendee.id)}
                                                    className="h-4 w-4"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{attendee.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {attendee.role} • {attendee.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedAttendees.length > 0 && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm font-medium text-blue-800 mb-2">
                                                Selected Attendees ({selectedAttendees.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedAttendees.map(attendeeId => {
                                                    const attendee = attendees.find(a => a.id === attendeeId);
                                                    return (
                                                        <Badge
                                                            key={attendeeId}
                                                            variant="secondary"
                                                            className="bg-blue-100 text-blue-800 text-xs py-1 px-2"
                                                        >
                                                            {attendee?.name}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAttendeeToggle(attendeeId);
                                                                }}
                                                                className="ml-1 hover:text-blue-600"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Event Preview */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Quick Preview</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        How your event will appear
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                                        {formData.title ? (
                                            <>
                                                <div className="font-medium text-sm sm:text-base line-clamp-2">{formData.title}</div>
                                                {formData.type && (
                                                    <Badge variant="secondary" className={
                                                        `text-xs ${eventTypes.find(t => t.value === formData.type)?.color || 'bg-gray-100 text-gray-800'}`
                                                    }>
                                                        {formData.type}
                                                    </Badge>
                                                )}
                                                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                                                    {formData.startDate && (
                                                        <div className="flex items-start gap-2">
                                                            <Calendar className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span>
                                {new Date(formData.startDate).toLocaleDateString()}
                                                                {formData.endDate && formData.endDate !== formData.startDate && (
                                                                    <> - {new Date(formData.endDate).toLocaleDateString()}</>
                                                                )}
                              </span>
                                                        </div>
                                                    )}
                                                    {!formData.isAllDay && formData.startTime && (
                                                        <div className="flex items-start gap-2">
                                                            <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span>{formData.startTime} - {formData.endTime}</span>
                                                        </div>
                                                    )}
                                                    {formData.location && (
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{formData.location}</span>
                                                        </div>
                                                    )}
                                                    {selectedAttendees.length > 0 && (
                                                        <div className="flex items-start gap-2">
                                                            <Users className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span>{selectedAttendees.length} attendee{selectedAttendees.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground text-xs sm:text-sm">
                                                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                                                Event preview will appear here
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}