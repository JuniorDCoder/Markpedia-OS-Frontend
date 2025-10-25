// services/recognitionService.ts
import { Recognition, RecognitionStats, DepartmentPerformance, PeerKudos } from '@/types/recognition';

class RecognitionService {
    private recognitions: Recognition[] = [
        {
            id: '1',
            employeeId: '2',
            employeeName: 'Marie Ngu',
            department: 'Logistics',
            type: 'employee-month',
            title: 'Employee of the Month',
            description: 'Consistent excellence in logistics operations and customer satisfaction',
            ersScore: 92,
            awardedBy: '1',
            approvedBy: '1',
            approvalStatus: 'approved',
            dateAwarded: '2024-01-15',
            postedToFeed: true,
            createdAt: '2024-01-15T10:00:00Z',
            month: 'January',
            year: 2024,
            quarter: 1
        },
        {
            id: '2',
            employeeId: '3',
            employeeName: 'Joe Tassi',
            department: 'Operations',
            type: 'employee-quarter',
            title: 'Employee of the Quarter',
            description: 'Outstanding performance and KPI improvement over Q4 2023',
            ersScore: 89,
            awardedBy: '1',
            approvalStatus: 'pending',
            dateAwarded: '2024-01-12',
            postedToFeed: false,
            createdAt: '2024-01-12T14:30:00Z',
            month: 'January',
            year: 2024,
            quarter: 1
        },
        {
            id: '3',
            employeeId: '4',
            employeeName: 'Ulrich Atem',
            department: 'Tech',
            type: 'innovation',
            title: 'Innovation Award',
            description: 'Developed AI matching pilot that improved efficiency by 40%',
            ersScore: 87,
            awardedBy: '1',
            approvedBy: '1',
            approvalStatus: 'approved',
            dateAwarded: '2024-01-10',
            postedToFeed: true,
            createdAt: '2024-01-10T16:45:00Z',
            month: 'January',
            year: 2024,
            quarter: 1
        },
        {
            id: '4',
            employeeId: '5',
            employeeName: 'Cyrille',
            department: 'Marketing',
            type: 'team-spirit',
            title: 'Team Spirit Award',
            description: 'Exceptional collaboration and peer support across departments',
            ersScore: 84,
            awardedBy: '1',
            approvalStatus: 'pending',
            dateAwarded: '2024-01-08',
            postedToFeed: false,
            createdAt: '2024-01-08T09:20:00Z',
            month: 'January',
            year: 2024,
            quarter: 1
        }
    ];

    private departmentPerformance: DepartmentPerformance[] = [
        { department: 'Tech', avgOkrScore: 82, attendance: 90, collaboration: 85, overallIndex: 86 },
        { department: 'Logistics', avgOkrScore: 88, attendance: 92, collaboration: 80, overallIndex: 87 },
        { department: 'Sales', avgOkrScore: 75, attendance: 89, collaboration: 70, overallIndex: 78 },
        { department: 'HR', avgOkrScore: 83, attendance: 95, collaboration: 88, overallIndex: 88 },
        { department: 'Marketing', avgOkrScore: 79, attendance: 88, collaboration: 75, overallIndex: 81 }
    ];

    private peerKudos: PeerKudos[] = [
        {
            id: '1',
            fromEmployee: 'Marie Ngu',
            fromEmployeeId: '2',
            toEmployee: 'Ulrich Atem',
            toEmployeeId: '4',
            message: 'Thanks to Ulrich for helping with the logistics sync API!',
            reactions: ['1', '3'],
            createdAt: '2024-01-15T08:30:00Z'
        },
        {
            id: '2',
            fromEmployee: 'Cyrille',
            fromEmployeeId: '5',
            toEmployee: 'Team',
            toEmployeeId: 'all',
            message: 'Teamwork made the trade video launch successful. Kudos to everyone!',
            reactions: ['1', '2', '3', '4'],
            createdAt: '2024-01-14T14:20:00Z'
        },
        {
            id: '3',
            fromEmployee: 'Joe Tassi',
            fromEmployeeId: '3',
            toEmployee: 'HR Team',
            toEmployeeId: 'hr',
            message: 'Appreciate HR for the quick response to field requests!',
            reactions: ['2', '4'],
            createdAt: '2024-01-14T11:15:00Z'
        }
    ];

    private stats: RecognitionStats = {
        topPerformer: { name: 'Marie Ngu', score: 92 },
        topDepartment: { name: 'HR', score: 88 },
        mostInnovative: { name: 'Ulrich Atem', score: 87 },
        bestTeamCollaboration: { name: 'Tech Team', score: 85 },
        pendingApprovals: 2
    };

    async getRecognitions(filters?: {
        type?: string;
        status?: string;
        department?: string;
        period?: string;
    }): Promise<Recognition[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filtered = this.recognitions;

        if (filters?.type && filters.type !== 'all') {
            filtered = filtered.filter(r => r.type === filters.type);
        }

        if (filters?.status && filters.status !== 'all') {
            filtered = filtered.filter(r => r.approvalStatus === filters.status);
        }

        if (filters?.department && filters.department !== 'all') {
            filtered = filtered.filter(r => r.department === filters.department);
        }

        return filtered;
    }

    async getRecognitionStats(): Promise<RecognitionStats> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.stats;
    }

    async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return this.departmentPerformance;
    }

    async getPeerKudos(): Promise<PeerKudos[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.peerKudos;
    }

    async addRecognition(recognition: Omit<Recognition, 'id' | 'createdAt'>): Promise<Recognition> {
        await new Promise(resolve => setTimeout(resolve, 600));

        const newRecognition: Recognition = {
            ...recognition,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        this.recognitions.unshift(newRecognition);
        return newRecognition;
    }

    async updateRecognitionStatus(id: string, status: 'approved' | 'rejected', approvedBy: string): Promise<Recognition> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const recognition = this.recognitions.find(r => r.id === id);
        if (!recognition) {
            throw new Error('Recognition not found');
        }

        recognition.approvalStatus = status;
        recognition.approvedBy = approvedBy;

        if (status === 'approved') {
            recognition.postedToFeed = true;
        }

        return recognition;
    }

    async addPeerKudos(kudos: Omit<PeerKudos, 'id' | 'createdAt'>): Promise<PeerKudos> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const newKudos: PeerKudos = {
            ...kudos,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        this.peerKudos.unshift(newKudos);
        return newKudos;
    }
}

export const recognitionService = new RecognitionService();