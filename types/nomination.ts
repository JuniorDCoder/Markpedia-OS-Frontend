// types/nomination.ts
export interface NominationFormData {
    employeeId: string;
    type: 'employee-month' | 'employee-quarter' | 'department-quarter' | 'innovation' | 'team-spirit' | 'leadership';
    title: string;
    description: string;
    evidence: string;
    metrics: string;
    alignmentWithValues: string[];
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    avatar?: string;
    currentOkrScore?: number;
    attendanceScore?: number;
    ersScore?: number;
}