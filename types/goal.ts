// types/goal.ts
export interface Objective {
    id: string;
    title: string;
    description: string;
    type: 'company' | 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily';
    level: 'company' | 'department' | 'team' | 'individual';
    timeframe: '3-5-years' | 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily';
    startDate: string;
    endDate: string;
    ownerId: string;
    ownerName: string;
    ownerRole: string;
    department?: string;
    status: 'on-track' | 'needs-attention' | 'at-risk' | 'off-track' | 'completed';
    progress: number;
    parentObjectiveId?: string;
    keyResults: KeyResult[];
    initiatives: Initiative[];
    alignmentPath: string[]; // Array of parent objective IDs
    visibility: 'ceo' | 'cxo' | 'directors' | 'managers' | 'employees' | 'all';
    createdAt: string;
    updatedAt: string;
}

export interface KeyResult {
    id: string;
    objectiveId: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    progress: number;
    status: 'on-track' | 'needs-attention' | 'at-risk' | 'off-track' | 'completed';
    kpis: KPI[];
    initiatives: string[];
}

export interface KPI {
    id: string;
    keyResultId: string;
    name: string;
    description: string;
    type: 'input' | 'output' | 'efficiency' | 'quality' | 'growth';
    targetValue: number;
    currentValue: number;
    unit: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export interface Initiative {
    id: string;
    objectiveId: string;
    title: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
    progress: number;
    ownerId: string;
    deadline: string;
}

export interface GoalStats {
    totalObjectives: number;
    onTrack: number;
    needsAttention: number;
    atRisk: number;
    completed: number;
    alignmentScore: number;
    departmentBreakdown: {
        department: string;
        objectives: number;
        progress: number;
    }[];
}
export interface ObjectiveFormData {
    title: string;
    description: string;
    type: 'company' | 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily';
    level: 'company' | 'department' | 'team' | 'individual';
    timeframe: '3-5-years' | 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily';
    startDate: string;
    endDate: string;
    status: 'on-track' | 'needs-attention' | 'at-risk' | 'off-track' | 'completed';
    category: string;
    department?: string;
    parentObjectiveId?: string;
    visibility: 'ceo' | 'cxo' | 'directors' | 'managers' | 'employees' | 'all';
}

export interface KeyResultFormData {
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    kpis: KPICreateData[];
}

export interface KPICreateData {
    name: string;
    description: string;
    type: 'input' | 'output' | 'efficiency' | 'quality' | 'growth';
    targetValue: number;
    currentValue: number;
    unit: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}