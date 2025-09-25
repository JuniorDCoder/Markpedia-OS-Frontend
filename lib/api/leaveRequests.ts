import { LeaveRequest } from '@/types';

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
    {
        id: '1',
        userId: '2',
        userName: 'John Doe',
        type: 'Annual',
        startDate: '2024-02-15',
        endDate: '2024-02-20',
        days: 4,
        reason: 'Family vacation',
        status: 'Pending',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
    {
        id: '2',
        userId: '3',
        userName: 'Jane Smith',
        type: 'Sick',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        days: 2,
        reason: 'Medical appointment and recovery',
        status: 'Approved',
        approvedBy: '1',
        approvedByName: 'Admin User',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-19'
    },
    {
        id: '3',
        userId: '2',
        userName: 'John Doe',
        type: 'Personal',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        days: 1,
        reason: 'Personal matters',
        status: 'Rejected',
        approvedBy: '1',
        approvedByName: 'Admin User',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-21'
    }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const leaveRequestService = {
    // Get all leave requests
    async getLeaveRequests(): Promise<LeaveRequest[]> {
        await delay(500);
        return [...mockLeaveRequests];
    },

    // Get leave request by ID
    async getLeaveRequest(id: string): Promise<LeaveRequest | null> {
        await delay(300);
        return mockLeaveRequests.find(request => request.id === id) || null;
    },

    // Create new leave request
    async createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
        await delay(500);
        const newRequest: LeaveRequest = {
            ...data,
            id: (mockLeaveRequests.length + 1).toString(),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        mockLeaveRequests.push(newRequest);
        return newRequest;
    },

    // Update leave request
    async updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
        await delay(500);
        const index = mockLeaveRequests.findIndex(request => request.id === id);
        if (index === -1) return null;

        const updatedRequest = {
            ...mockLeaveRequests[index],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        mockLeaveRequests[index] = updatedRequest;
        return updatedRequest;
    },

    // Delete leave request
    async deleteLeaveRequest(id: string): Promise<boolean> {
        await delay(500);
        const index = mockLeaveRequests.findIndex(request => request.id === id);
        if (index === -1) return false;

        mockLeaveRequests.splice(index, 1);
        return true;
    },

    // Approve/Reject leave request
    async updateLeaveRequestStatus(id: string, status: 'Approved' | 'Rejected', approvedBy: string, approvedByName: string): Promise<LeaveRequest | null> {
        return this.updateLeaveRequest(id, {
            status,
            approvedBy,
            approvedByName,
            updatedAt: new Date().toISOString().split('T')[0]
        });
    },
    getAllLeaveRequests() {

    }
};