import { LeaveRequest, LeaveBalance, LeaveStats } from '@/types';

// Mock data based on Cameroon Labour Code
const mockLeaveRequests: LeaveRequest[] = [
    {
        id: '1',
        employee_id: '2',
        department_id: '1',
        userName: 'John Doe',
        departmentName: 'Sales',
        leave_type: 'Annual',
        start_date: '2024-02-15',
        end_date: '2024-02-20',
        total_days: 4,
        reason: 'Annual vacation / personal rest',
        status: 'Manager Approved',
        applied_on: '2024-01-15',
        approved_by_manager: '1',
        balance_before: 18,
        balance_after: 14,
        created_at: '2024-01-15',
        updated_at: '2024-01-16',
        backup_person: 'Jane Smith',
        contact_during_leave: 'john.doe@email.com'
    },
    {
        id: '2',
        employee_id: '3',
        department_id: '2',
        userName: 'Jane Smith',
        departmentName: 'Marketing',
        leave_type: 'Sick',
        start_date: '2024-01-20',
        end_date: '2024-01-22',
        total_days: 2,
        reason: 'Personal illness or injury',
        status: 'HR Approved',
        proof: { medical_certificate: 'doctor_note.pdf' },
        applied_on: '2024-01-18',
        approved_by_manager: '1',
        approved_by_hr: '4',
        created_at: '2024-01-18',
        updated_at: '2024-01-19'
    },
    {
        id: '3',
        employee_id: '5',
        department_id: '3',
        userName: 'Sarah Lin',
        departmentName: 'HR',
        leave_type: 'Maternity',
        start_date: '2024-11-01',
        end_date: '2025-02-10',
        total_days: 102,
        reason: 'Childbirth preparation',
        status: 'CEO Approved',
        applied_on: '2024-10-15',
        approved_by_manager: '1',
        approved_by_hr: '4',
        approved_by_ceo: '6',
        created_at: '2024-10-15',
        updated_at: '2024-10-20'
    },
    {
        id: '4',
        employee_id: '2',
        department_id: '1',
        userName: 'John Doe',
        departmentName: 'Sales',
        leave_type: 'Paternity',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        total_days: 3,
        reason: 'Childbirth support for spouse/partner',
        status: 'Pending',
        applied_on: '2024-02-25',
        created_at: '2024-02-25',
        updated_at: '2024-02-25'
    }
];

// Leave reasons based on policy document
export const LEAVE_REASONS = {
    Annual: [
        'Annual vacation / personal rest',
        'Family visit or travel',
        'Mental or physical recovery (burnout prevention)',
        'Personal development or reflection period',
        'Travel abroad (non-business)',
        'Marriage preparation or honeymoon',
        'House relocation or major personal logistics'
    ],
    Sick: [
        'Personal illness or injury',
        'Hospitalization / surgery recovery',
        'Doctor-prescribed rest',
        'Occupational accident (work-related)',
        'Infectious illness (COVID, flu, etc.)',
        'Chronic health treatment / therapy'
    ],
    Maternity: [
        'Childbirth preparation',
        'Post-delivery recovery period',
        'Newborn care (within legal maternity period)'
    ],
    Paternity: [
        'Childbirth support for spouse/partner',
        'Postpartum assistance and family time'
    ],
    Compassionate: [
        'Death of an immediate family member (parent, spouse, child, sibling)',
        'Serious illness of a close relative',
        'Family emergency or accident',
        'Court or legal obligation (non-disciplinary)'
    ],
    Study: [
        'Exam attendance or preparation',
        'Professional certification course',
        'Graduation or thesis defense'
    ],
    Official: [
        'Business trip / conference / summit',
        'Government or regulatory meeting',
        'Partnership or client visit',
        'Training, workshop, or seminar attendance'
    ],
    Unpaid: [
        'Family care / personal matter',
        'Extended travel abroad',
        'Medical follow-up beyond paid allowance',
        'Personal project (approved case)'
    ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const leaveRequestService = {
    async getLeaveRequests(): Promise<LeaveRequest[]> {
        await delay(500);
        return [...mockLeaveRequests];
    },

    async getLeaveRequest(id: string): Promise<LeaveRequest | null> {
        await delay(300);
        return mockLeaveRequests.find(request => request.id === id) || null;
    },

    async createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at' | 'applied_on'>): Promise<LeaveRequest> {
        await delay(500);
        const newRequest: LeaveRequest = {
            ...data,
            id: (mockLeaveRequests.length + 1).toString(),
            applied_on: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockLeaveRequests.push(newRequest);
        return newRequest;
    },

    async updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
        await delay(500);
        const index = mockLeaveRequests.findIndex(request => request.id === id);
        if (index === -1) return null;

        const updatedRequest = {
            ...mockLeaveRequests[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        mockLeaveRequests[index] = updatedRequest;
        return updatedRequest;
    },

    async deleteLeaveRequest(id: string): Promise<boolean> {
        await delay(500);
        const index = mockLeaveRequests.findIndex(request => request.id === id);
        if (index === -1) return false;

        mockLeaveRequests.splice(index, 1);
        return true;
    },

    // Manager approval
    async managerApprove(id: string, managerId: string, remarks?: string): Promise<LeaveRequest | null> {
        return this.updateLeaveRequest(id, {
            status: 'Manager Approved',
            approved_by_manager: managerId,
            remarks,
            updated_at: new Date().toISOString()
        });
    },

    // HR approval
    async hrApprove(id: string, hrId: string, balance_before: number, balance_after: number, remarks?: string): Promise<LeaveRequest | null> {
        return this.updateLeaveRequest(id, {
            status: 'HR Approved',
            approved_by_hr: hrId,
            balance_before,
            balance_after,
            remarks,
            updated_at: new Date().toISOString()
        });
    },

    // CEO approval for special cases
    async ceoApprove(id: string, ceoId: string, remarks?: string): Promise<LeaveRequest | null> {
        return this.updateLeaveRequest(id, {
            status: 'CEO Approved',
            approved_by_ceo: ceoId,
            remarks,
            updated_at: new Date().toISOString()
        });
    },

    // Reject leave request
    async rejectLeaveRequest(id: string, rejectedBy: string, role: string, remarks?: string): Promise<LeaveRequest | null> {
        const updates: Partial<LeaveRequest> = {
            status: 'Rejected',
            remarks,
            updated_at: new Date().toISOString()
        };

        if (role === 'Manager') updates.approved_by_manager = rejectedBy;
        if (role === 'HR') updates.approved_by_hr = rejectedBy;
        if (role === 'CEO') updates.approved_by_ceo = rejectedBy;

        return this.updateLeaveRequest(id, updates);
    },

    async getLeaveBalance(userId: string): Promise<LeaveBalance> {
        await delay(300);
        // Mock balance data - in real app, calculate based on accrual rules
        return {
            annual: 18, // 1.5 days per month * 12 months
            sick: 30, // Up to 6 months
            compassionate: 5,
            paternity: 5,
            maternity: 98 // 14 weeks
        };
    },

    async getLeaveStats(): Promise<LeaveStats> {
        await delay(300);
        const today = new Date().toISOString().split('T')[0];
        const employeesOnLeave = mockLeaveRequests.filter(req =>
            req.start_date <= today && req.end_date >= today &&
            ['Manager Approved', 'HR Approved', 'CEO Approved'].includes(req.status)
        ).length;

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const upcomingLeaves = mockLeaveRequests.filter(req =>
            req.start_date <= thirtyDaysLater.toISOString().split('T')[0] &&
            req.start_date > today &&
            ['Manager Approved', 'HR Approved', 'CEO Approved'].includes(req.status)
        ).length;

        return {
            employeesOnLeave,
            upcomingLeaves,
            pendingRequests: mockLeaveRequests.filter(req => req.status === 'Pending').length,
            leaveCostImpact: mockLeaveRequests
                .filter(req => ['Manager Approved', 'HR Approved', 'CEO Approved'].includes(req.status))
                .reduce((sum, req) => sum + req.total_days, 0) * 100, // Mock cost calculation
            utilizationRate: 65 // Mock utilization rate
        };
    },

    getLeaveReasons() {
        return LEAVE_REASONS;
    }
};