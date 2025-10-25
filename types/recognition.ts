// types/recognition.ts
export interface Recognition {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    type: 'employee-month' | 'employee-quarter' | 'department-quarter' | 'innovation' | 'team-spirit' | 'leadership';
    title: string;
    description: string;
    ersScore: number;
    awardedBy: string;
    approvedBy?: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    dateAwarded: string;
    proofUrl?: string;
    postedToFeed: boolean;
    createdAt: string;
    month: string;
    year: number;
    quarter: number;
}

export interface RecognitionStats {
    topPerformer: { name: string; score: number };
    topDepartment: { name: string; score: number };
    mostInnovative: { name: string; score: number };
    bestTeamCollaboration: { name: string; score: number };
    pendingApprovals: number;
}

export interface DepartmentPerformance {
    department: string;
    avgOkrScore: number;
    attendance: number;
    collaboration: number;
    overallIndex: number;
}

export interface PeerKudos {
    id: string;
    fromEmployee: string;
    fromEmployeeId: string;
    toEmployee: string;
    toEmployeeId: string;
    message: string;
    reactions: string[];
    createdAt: string;
}