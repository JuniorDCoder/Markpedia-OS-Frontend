import {
    CEOAvailability,
    TravelRequest,
    AppointmentRequest,
    CompanyEvent,
    EventFeedback,
    TimeDashboardMetrics
} from '@/types/time-management';

// Mock data matching the client requirements
let mockAvailability: CEOAvailability[] = [
    {
        id: "1",
        date: "2024-01-15",
        status: "available",
        timeSlots: [
            { startTime: "09:00", endTime: "17:00", type: "available" }
        ],
        location: "Office",
        notes: "Internal meetings",
        updatedBy: "pa-1",
        updatedAt: "2024-01-14"
    },
    {
        id: "2",
        date: "2024-01-16",
        status: "limited",
        timeSlots: [
            { startTime: "10:00", endTime: "15:00", type: "limited" }
        ],
        location: "Virtual",
        notes: "Partner RDVs only",
        updatedBy: "pa-1",
        updatedAt: "2024-01-14"
    },
    {
        id: "3",
        date: "2024-01-17",
        status: "strategic-block",
        timeSlots: [
            { startTime: "08:00", endTime: "12:00", type: "unavailable" }
        ],
        location: "Home Office",
        notes: "Planning session",
        updatedBy: "ceo-1",
        updatedAt: "2024-01-14"
    }
];

let mockTravelRequests: TravelRequest[] = [
    {
        id: "1",
        travelId: "TRV-2025-007",
        destination: "Douala, Cameroon",
        purpose: "Canton Fair - Supplier Partnership Visit",
        type: "business",
        departureDate: "2024-01-20",
        returnDate: "2024-01-25",
        duration: 5,
        status: "confirmed",
        transportMode: "air",
        provider: "Air France",
        accommodation: "Hilton Douala",
        meetings: [
            {
                id: "m1",
                title: "Supplier Meeting - Tech Parts Inc",
                date: "2024-01-21",
                time: "14:00",
                location: "Hilton Conference Room",
                participants: ["Supplier Rep"]
            }
        ],
        companions: ["cto-1"],
        visaStatus: "not-needed",
        budgetEstimate: 2500000,
        paymentMethod: "company-card",
        financeApproval: true,
        remarks: "Focus on new supplier partnerships",
        documents: ["itinerary.pdf", "invitation.pdf"],
        emergencyContact: "+237 6XX XXX XXX",
        createdBy: "pa-1",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-12"
    }
];

let mockAppointmentRequests: AppointmentRequest[] = [
    {
        id: "1",
        requestId: "APPT-2025-001",
        requesterName: "Marie Ngu",
        department: "Logistics",
        meetingSubject: "Q1 Logistics Strategy Review",
        preferredDates: [
            { date: "2024-01-16", time: "10:00" },
            { date: "2024-01-16", time: "14:00" },
            { date: "2024-01-17", time: "11:00" }
        ],
        duration: 60,
        mode: "in-person",
        priority: "normal",
        attachments: ["strategy-doc.pdf"],
        paDecision: "pending",
        createdAt: "2024-01-14",
        updatedAt: "2024-01-14"
    }
];

let mockCompanyEvents: CompanyEvent[] = [
    {
        id: "1",
        eventId: "EV-2025-0001",
        title: "Markpedia Innovation Day 2025",
        type: "innovation",
        organizer: "Product Team",
        startDate: "2024-02-15",
        endDate: "2024-02-15",
        venue: "Main Conference Hall",
        departments: ["Product", "R&D", "Tech"],
        budgetEstimate: 5000000,
        objective: "Showcase new features and foster innovation culture",
        agenda: "09:00 Welcome, 10:00 Product Demos, 14:00 Hackathon",
        speakers: ["CTO", "Product Lead"],
        attachments: ["agenda.pdf", "sponsor-deck.pdf"],
        visibility: "company-wide",
        status: "approved",
        createdBy: "product-1",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-12"
    }
];

export const timeManagementService = {
    // CEO Availability
    async getCEOAvailability(date?: string): Promise<CEOAvailability[]> {
        if (date) {
            return Promise.resolve(mockAvailability.filter(a => a.date === date));
        }
        return Promise.resolve(mockAvailability);
    },

    async updateAvailability(availability: CEOAvailability): Promise<CEOAvailability> {
        const index = mockAvailability.findIndex(a => a.id === availability.id);
        if (index >= 0) {
            mockAvailability[index] = { ...availability, updatedAt: new Date().toISOString() };
        } else {
            mockAvailability.push({
                ...availability,
                id: Date.now().toString(),
                updatedAt: new Date().toISOString()
            });
        }
        return Promise.resolve(availability);
    },

    // Travel Management
    async listTravelRequests(): Promise<TravelRequest[]> {
        return Promise.resolve(mockTravelRequests);
    },

    async createTravelRequest(request: Omit<TravelRequest, 'id' | 'travelId' | 'createdAt' | 'updatedAt'>): Promise<TravelRequest> {
        const newRequest: TravelRequest = {
            ...request,
            id: Date.now().toString(),
            travelId: `TRV-${new Date().getFullYear()}-${String(mockTravelRequests.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockTravelRequests.push(newRequest);
        return Promise.resolve(newRequest);
    },

    async updateTravelStatus(id: string, status: TravelRequest['status']): Promise<TravelRequest> {
        const request = mockTravelRequests.find(req => req.id === id);
        if (!request) throw new Error('Travel request not found');

        request.status = status;
        request.updatedAt = new Date().toISOString();
        return Promise.resolve(request);
    },

    // Appointment Requests
    async listAppointmentRequests(): Promise<AppointmentRequest[]> {
        return Promise.resolve(mockAppointmentRequests);
    },

    async updateAppointmentDecision(id: string, decision: AppointmentRequest['paDecision'], finalSchedule?: string): Promise<AppointmentRequest> {
        const request = mockAppointmentRequests.find(req => req.id === id);
        if (!request) throw new Error('Appointment request not found');

        request.paDecision = decision;
        if (finalSchedule) request.finalSchedule = finalSchedule;
        request.updatedAt = new Date().toISOString();
        return Promise.resolve(request);
    },

    // Company Events
    async listCompanyEvents(): Promise<CompanyEvent[]> {
        return Promise.resolve(mockCompanyEvents);
    },

    async createCompanyEvent(event: Omit<CompanyEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<CompanyEvent> {
        const newEvent: CompanyEvent = {
            ...event,
            id: Date.now().toString(),
            eventId: `EV-${new Date().getFullYear()}-${String(mockCompanyEvents.length + 1).padStart(4, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockCompanyEvents.push(newEvent);
        return Promise.resolve(newEvent);
    },

    // Dashboard Metrics
    async getDashboardMetrics(): Promise<TimeDashboardMetrics> {
        const upcomingTrips = mockTravelRequests.filter(t => t.status === 'confirmed' || t.status === 'planned').length;
        const totalBudget = mockTravelRequests.reduce((sum, t) => sum + t.budgetEstimate, 0);
        const utilizedBudget = mockTravelRequests
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.budgetEstimate, 0);

        const budgetUtilization = totalBudget > 0 ? (utilizedBudget / totalBudget) * 100 : 0;

        const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
        const travelDaysThisQuarter = mockTravelRequests
            .filter(t => {
                const tripDate = new Date(t.departureDate);
                const tripQuarter = Math.floor(tripDate.getMonth() / 3) + 1;
                return tripQuarter === currentQuarter;
            })
            .reduce((sum, t) => sum + t.duration, 0);

        const pendingApprovals = mockTravelRequests.filter(t => t.status === 'planned').length +
            mockAppointmentRequests.filter(a => a.paDecision === 'pending').length;

        const tripPurposeBreakdown = mockTravelRequests.reduce((acc, trip) => {
            acc[trip.type] = (acc[trip.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalEvents = mockCompanyEvents.length;
        const attendanceRate = 75; // Mock data
        const employeeSatisfaction = 4.2; // Mock data

        return {
            upcomingTrips,
            budgetUtilization,
            travelDaysThisQuarter,
            pendingApprovals,
            tripPurposeBreakdown,
            totalEvents,
            attendanceRate,
            employeeSatisfaction,
            pendingAppointments: mockAppointmentRequests.filter(a => a.paDecision === 'pending').length
        };
    },
    async getAvailability(id: string): Promise<CEOAvailability | undefined> {
        return Promise.resolve(mockAvailability.find(a => a.id === id));
    },

    async getTravelRequest(id: string): Promise<TravelRequest | undefined> {
        return Promise.resolve(mockTravelRequests.find(t => t.id === id));
    },

    async updateTravelRequest(id: string, updates: Partial<TravelRequest>): Promise<TravelRequest> {
        const request = mockTravelRequests.find(t => t.id === id);
        if (!request) throw new Error('Travel request not found');

        const updated = { ...request, ...updates, updatedAt: new Date().toISOString() };
        mockTravelRequests = mockTravelRequests.map(t => t.id === id ? updated : t);
        return Promise.resolve(updated);
    },

    async getAppointmentRequest(id: string): Promise<AppointmentRequest | undefined> {
        return Promise.resolve(mockAppointmentRequests.find(a => a.id === id));
    },
    async createAppointmentRequest(request: Omit<AppointmentRequest, 'id' | 'requestId' | 'createdAt' | 'updatedAt'>): Promise<AppointmentRequest> {
        const newRequest: AppointmentRequest = {
            ...request,
            id: Date.now().toString(),
            requestId: `APPT-${new Date().getFullYear()}-${String(mockAppointmentRequests.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockAppointmentRequests.push(newRequest);
        return Promise.resolve(newRequest);
    },

    async createCompanyEvent(event: Omit<CompanyEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<CompanyEvent> {
        const newEvent: CompanyEvent = {
            ...event,
            id: Date.now().toString(),
            eventId: `EV-${new Date().getFullYear()}-${String(mockCompanyEvents.length + 1).padStart(4, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockCompanyEvents.push(newEvent);
        return Promise.resolve(newEvent);
    },

};