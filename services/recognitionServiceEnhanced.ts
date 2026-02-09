/**
 * Enhanced Recognition Service - Integrates with real backend API
 * Falls back to mock data if API is unavailable
 */
import api from './api';
import { Recognition, RecognitionStats, DepartmentPerformance, PeerKudos } from '@/types/recognition';

const API_BASE = '/community/recognition';

// Transform backend response to frontend format
function transformRecognition(backendRec: any): Recognition {
    return {
        id: backendRec.id,
        employeeId: backendRec.recipient_id,
        employeeName: backendRec.recipient_name || 'Unknown',
        department: backendRec.department || backendRec.recipient_department,
        type: mapRecognitionType(backendRec.recognition_type),
        title: backendRec.title,
        description: backendRec.description || '',
        ersScore: backendRec.points || 0,
        awardedBy: backendRec.nominated_by,
        approvedBy: backendRec.approved_by,
        approvalStatus: backendRec.is_approved ? 'approved' : 'pending',
        dateAwarded: backendRec.approved_at || backendRec.created_at,
        postedToFeed: backendRec.is_public && backendRec.is_approved,
        createdAt: backendRec.created_at,
        month: new Date(backendRec.created_at).toLocaleString('default', { month: 'long' }),
        year: new Date(backendRec.created_at).getFullYear(),
        quarter: Math.floor((new Date(backendRec.created_at).getMonth() + 3) / 3)
    };
}

function mapRecognitionType(backendType: string): Recognition['type'] {
    const typeMap: Record<string, Recognition['type']> = {
        'employee_of_month': 'employee-month',
        'employee_of_year': 'employee-quarter',
        'team_achievement': 'department-quarter',
        'innovation': 'innovation',
        'leadership': 'leadership',
        'service_excellence': 'team-spirit',
        'spot_award': 'employee-month',
        'milestone': 'team-spirit',
        'promotion': 'leadership',
        'peer_kudos': 'team-spirit'
    };
    return typeMap[backendType] || 'team-spirit';
}

function mapRecognitionTypeToBackend(frontendType: string): string {
    const typeMap: Record<string, string> = {
        'employee-month': 'employee_of_month',
        'employee-quarter': 'employee_of_year',
        'department-quarter': 'team_achievement',
        'innovation': 'innovation',
        'leadership': 'leadership',
        'team-spirit': 'service_excellence'
    };
    return typeMap[frontendType] || 'peer_kudos';
}

function transformKudos(backendKudos: any): PeerKudos {
    return {
        id: backendKudos.id,
        fromEmployee: backendKudos.sender_name || 'Unknown',
        fromEmployeeId: backendKudos.sender_id,
        toEmployee: backendKudos.recipient_name || 'Unknown',
        toEmployeeId: backendKudos.recipient_id,
        message: backendKudos.message,
        reactions: Object.values(backendKudos.reactions || {}).flat() as string[],
        createdAt: backendKudos.created_at
    };
}

// Mock data for fallback
const MOCK_RECOGNITIONS: Recognition[] = [
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
    }
];

const MOCK_STATS: RecognitionStats = {
    topPerformer: { name: 'Marie Ngu', score: 92 },
    topDepartment: { name: 'HR', score: 88 },
    mostInnovative: { name: 'Ulrich Atem', score: 87 },
    bestTeamCollaboration: { name: 'Tech Team', score: 85 },
    pendingApprovals: 2
};

const MOCK_DEPT_PERF: DepartmentPerformance[] = [
    { department: 'Tech', avgOkrScore: 82, attendance: 90, collaboration: 85, overallIndex: 86 },
    { department: 'Logistics', avgOkrScore: 88, attendance: 92, collaboration: 80, overallIndex: 87 },
    { department: 'HR', avgOkrScore: 83, attendance: 95, collaboration: 88, overallIndex: 88 }
];

const MOCK_KUDOS: PeerKudos[] = [
    {
        id: '1',
        fromEmployee: 'Marie Ngu',
        fromEmployeeId: '2',
        toEmployee: 'Ulrich Atem',
        toEmployeeId: '4',
        message: 'Thanks to Ulrich for helping with the logistics sync API!',
        reactions: ['1', '3'],
        createdAt: '2024-01-15T08:30:00Z'
    }
];

class RecognitionService {
    private useApi = true;

    async getRecognitions(filters?: {
        type?: string;
        status?: string;
        department?: string;
        period?: string;
    }): Promise<Recognition[]> {
        if (this.useApi) {
            try {
                const params: any = {};
                if (filters?.type && filters.type !== 'all') {
                    params.recognition_type = mapRecognitionTypeToBackend(filters.type);
                }
                if (filters?.status && filters.status !== 'all') {
                    params.is_approved = filters.status === 'approved';
                }
                if (filters?.department && filters.department !== 'all') {
                    params.department = filters.department;
                }

                const response = await api.get(`${API_BASE}`, { params });
                return response.data.map(transformRecognition);
            } catch (error) {
                console.warn('API unavailable, using mock data');
                this.useApi = false;
            }
        }

        // Fallback to mock
        let filtered = [...MOCK_RECOGNITIONS];
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
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/stats`);
                const data = response.data;
                
                return {
                    topPerformer: data.top_recognized?.[0] 
                        ? { name: data.top_recognized[0].name, score: data.top_recognized[0].total_points }
                        : { name: 'N/A', score: 0 },
                    topDepartment: Object.entries(data.recognition_by_department || {})[0]
                        ? { name: Object.keys(data.recognition_by_department)[0], score: Object.values(data.recognition_by_department)[0] as number }
                        : { name: 'N/A', score: 0 },
                    mostInnovative: data.top_recognized?.[1] 
                        ? { name: data.top_recognized[1].name, score: data.top_recognized[1].total_points }
                        : { name: 'N/A', score: 0 },
                    bestTeamCollaboration: { name: 'Team', score: data.total_recognitions || 0 },
                    pendingApprovals: 0
                };
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_STATS;
    }

    async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/stats`);
                const deptData = response.data.recognition_by_department || {};
                
                return Object.entries(deptData).map(([dept, count]) => ({
                    department: dept,
                    avgOkrScore: 80,
                    attendance: 90,
                    collaboration: 85,
                    overallIndex: count as number
                }));
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_DEPT_PERF;
    }

    async getPeerKudos(): Promise<PeerKudos[]> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/kudos`);
                return response.data.map(transformKudos);
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_KUDOS;
    }

    async addRecognition(recognition: Omit<Recognition, 'id' | 'createdAt'>): Promise<Recognition> {
        if (this.useApi) {
            try {
                const response = await api.post(`${API_BASE}`, {
                    recipient_id: recognition.employeeId,
                    recognition_type: mapRecognitionTypeToBackend(recognition.type),
                    title: recognition.title,
                    description: recognition.description,
                    points: recognition.ersScore,
                    is_public: true
                });
                return transformRecognition(response.data);
            } catch (error) {
                console.warn('API unavailable, creating local recognition');
            }
        }

        const newRecognition: Recognition = {
            ...recognition,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        MOCK_RECOGNITIONS.unshift(newRecognition);
        return newRecognition;
    }

    async updateRecognitionStatus(id: string, status: 'approved' | 'rejected', approvedBy: string): Promise<Recognition> {
        if (this.useApi) {
            try {
                if (status === 'approved') {
                    await api.post(`${API_BASE}/${id}/approve`);
                } else {
                    await api.post(`${API_BASE}/${id}/reject`);
                }
                
                const response = await api.get(`${API_BASE}`);
                const rec = response.data.find((r: any) => r.id === id);
                return rec ? transformRecognition(rec) : MOCK_RECOGNITIONS[0];
            } catch (error) {
                console.warn('API unavailable');
            }
        }

        const recognition = MOCK_RECOGNITIONS.find(r => r.id === id);
        if (!recognition) throw new Error('Recognition not found');
        recognition.approvalStatus = status;
        recognition.approvedBy = approvedBy;
        if (status === 'approved') recognition.postedToFeed = true;
        return recognition;
    }

    async addPeerKudos(kudos: Omit<PeerKudos, 'id' | 'createdAt'>): Promise<PeerKudos> {
        if (this.useApi) {
            try {
                const response = await api.post(`${API_BASE}/kudos`, {
                    recipient_id: kudos.toEmployeeId,
                    message: kudos.message,
                    is_public: true
                });
                return transformKudos(response.data);
            } catch (error) {
                console.warn('API unavailable');
            }
        }

        const newKudos: PeerKudos = {
            ...kudos,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        MOCK_KUDOS.unshift(newKudos);
        return newKudos;
    }
}

export const recognitionService = new RecognitionService();
