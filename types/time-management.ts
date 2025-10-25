export interface CEOAvailability {
    id: string;
    date: string;
    status: 'available' | 'limited' | 'unavailable' | 'traveling' | 'strategic-block';
    timeSlots: TimeSlot[];
    location: string;
    notes?: string;
    updatedBy: string;
    updatedAt: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    type: 'available' | 'limited' | 'unavailable';
}

export interface TravelRequest {
    id: string;
    travelId: string; // TRV-2025-007
    destination: string;
    purpose: string;
    type: 'business' | 'event' | 'investor' | 'inspection' | 'csr';
    departureDate: string;
    returnDate: string;
    duration: number; // auto-calculated
    status: 'planned' | 'confirmed' | 'in-progress' | 'completed';
    transportMode: 'air' | 'road' | 'sea';
    provider: string;
    accommodation: string;
    meetings: LinkedMeeting[];
    companions: string[];
    visaStatus: 'not-needed' | 'pending' | 'approved';
    budgetEstimate: number;
    paymentMethod: 'company-card' | 'advance' | 'cash';
    financeApproval: boolean;
    remarks: string;
    documents: string[];
    emergencyContact: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentRequest {
    id: string;
    requestId: string;
    requesterName: string;
    department: string;
    meetingSubject: string;
    preferredDates: PreferredDate[];
    duration: number; // in minutes
    mode: 'in-person' | 'virtual' | 'call';
    priority: 'normal' | 'urgent';
    attachments: string[];
    paDecision: 'pending' | 'approved' | 'rescheduled' | 'declined';
    finalSchedule?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PreferredDate {
    date: string;
    time: string;
}

export interface CompanyEvent {
    id: string;
    eventId: string; // EV-2025-0001
    title: string;
    type: 'corporate' | 'recognition' | 'team-building' | 'training' | 'innovation' | 'social' | 'csr';
    organizer: string;
    startDate: string;
    endDate: string;
    venue: string;
    departments: string[];
    budgetEstimate: number;
    objective: string;
    agenda: string;
    speakers: string[];
    attachments: string[];
    visibility: 'company-wide' | 'departmental';
    status: 'planned' | 'approved' | 'completed';
    feedbackLink?: string;
    archived: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventFeedback {
    id: string;
    eventId: string;
    eventName: string;
    date: string;
    attendeeName: string;
    department: string;
    rating: number; // 1-5
    favoriteSession: string;
    suggestions: string;
    wouldAttendAgain: boolean;
    submittedAt: string;
}

export interface LinkedMeeting {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    participants: string[];
}

export interface TimeDashboardMetrics {
    upcomingTrips: number;
    budgetUtilization: number;
    travelDaysThisQuarter: number;
    pendingApprovals: number;
    tripPurposeBreakdown: Record<string, number>;
    totalEvents: number;
    attendanceRate: number;
    employeeSatisfaction: number;
    pendingAppointments: number;
}