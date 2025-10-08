export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    type: 'Meeting' | 'Training' | 'Holiday' | 'Deadline' | 'All-Hands' | 'Personal' | 'Other';
    location?: string;
    attendees?: string[];
    isAllDay: boolean;
    isRecurring: boolean;
    recurrenceRule?: string;
    createdBy: string;
    createdAt: string;
}

export interface Attendee {
    id: string;
    name: string;
    email: string;
    role: string;
}