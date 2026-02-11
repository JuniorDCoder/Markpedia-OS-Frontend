// services/goalService.ts
import { Objective, GoalStats } from '@/types/goal';

class GoalService {
    private objectives: Objective[] = [
        // 3-5 Year Company Objectives (CEO/Board Level)
        {
            id: '1',
            title: 'Become Africa\'s most trusted cross-border trade platform',
            description: 'Establish Markpedia as the leading digital trade platform across African markets',
            type: 'company',
            level: 'company',
            timeframe: '3-5-years',
            startDate: '2025-01-01',
            endDate: '2030-12-31',
            ownerId: '1',
            ownerName: 'CEO Office',
            ownerRole: 'CEO',
            status: 'on-track',
            progress: 20,
            visibility: 'ceo',
            alignmentPath: [],
            keyResults: [
                {
                    id: '1-1',
                    objectiveId: '1',
                    description: 'Achieve 1M annual transactions by 2030',
                    targetValue: 1000000,
                    currentValue: 150000,
                    unit: 'transactions',
                    progress: 15,
                    status: 'on-track',
                    kpis: [
                        {
                            id: 'kpi-1-1',
                            keyResultId: '1-1',
                            name: 'Transaction Volume Growth',
                            description: 'Monthly transaction volume growth rate',
                            type: 'growth',
                            targetValue: 15,
                            currentValue: 12,
                            unit: '%',
                            frequency: 'monthly'
                        }
                    ],
                    initiatives: ['Market expansion', 'Partnership development']
                },
                {
                    id: '1-2',
                    objectiveId: '1',
                    description: 'Establish presence in 10 African countries',
                    targetValue: 10,
                    currentValue: 3,
                    unit: 'countries',
                    progress: 30,
                    status: 'on-track',
                    kpis: [],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },

        // Annual Objectives
        {
            id: '2',
            title: 'Achieve 20M XAF GMV by Year End',
            description: 'Drive gross merchandise value growth through customer acquisition and retention',
            type: 'annual',
            level: 'company',
            timeframe: 'annual',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            ownerId: '1',
            ownerName: 'CEO Office',
            ownerRole: 'CEO',
            status: 'on-track',
            progress: 45,
            parentObjectiveId: '1',
            visibility: 'directors',
            alignmentPath: ['1'],
            keyResults: [
                {
                    id: '2-1',
                    objectiveId: '2',
                    description: 'Onboard 10,000 verified transactions',
                    targetValue: 10000,
                    currentValue: 4500,
                    unit: 'transactions',
                    progress: 45,
                    status: 'on-track',
                    kpis: [
                        {
                            id: 'kpi-2-1',
                            keyResultId: '2-1',
                            name: 'Transaction Count',
                            description: 'Total verified transactions',
                            type: 'output',
                            targetValue: 10000,
                            currentValue: 4500,
                            unit: 'transactions',
                            frequency: 'monthly'
                        }
                    ],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },

        // Quarterly Department Objectives
        {
            id: '3',
            title: 'Increase B2B Transaction Volume',
            description: 'Drive B2B transaction growth through enterprise partnerships',
            type: 'quarterly',
            level: 'department',
            timeframe: 'quarterly',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            ownerId: '2',
            ownerName: 'Sarah Johnson',
            ownerRole: 'Sales Director',
            department: 'Sales',
            status: 'needs-attention',
            progress: 65,
            parentObjectiveId: '2',
            visibility: 'managers',
            alignmentPath: ['1', '2'],
            keyResults: [
                {
                    id: '3-1',
                    objectiveId: '3',
                    description: 'Close 2,500 new enterprise deals',
                    targetValue: 2500,
                    currentValue: 1625,
                    unit: 'deals',
                    progress: 65,
                    status: 'needs-attention',
                    kpis: [
                        {
                            id: 'kpi-3-1',
                            keyResultId: '3-1',
                            name: 'Sales Volume',
                            description: 'Monthly sales deal volume',
                            type: 'output',
                            targetValue: 2500,
                            currentValue: 1625,
                            unit: 'deals',
                            frequency: 'weekly'
                        }
                    ],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },

        // Monthly Team Objectives
        {
            id: '4',
            title: 'Improve Platform Uptime',
            description: 'Maintain high platform reliability and performance',
            type: 'monthly',
            level: 'team',
            timeframe: 'monthly',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            ownerId: '3',
            ownerName: 'Mike Chen',
            ownerRole: 'Tech Lead',
            department: 'Technology',
            status: 'on-track',
            progress: 95,
            parentObjectiveId: '3',
            visibility: 'employees',
            alignmentPath: ['1', '2', '3'],
            keyResults: [
                {
                    id: '4-1',
                    objectiveId: '4',
                    description: 'Maintain 99.9% platform uptime',
                    targetValue: 99.9,
                    currentValue: 99.8,
                    unit: '%',
                    progress: 99,
                    status: 'on-track',
                    kpis: [
                        {
                            id: 'kpi-4-1',
                            keyResultId: '4-1',
                            name: 'Uptime KPI',
                            description: 'Platform availability percentage',
                            type: 'quality',
                            targetValue: 99.9,
                            currentValue: 99.8,
                            unit: '%',
                            frequency: 'daily'
                        }
                    ],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },

        // Weekly Individual Objectives
        {
            id: '5',
            title: 'Complete Backend API Tests',
            description: 'Ensure all backend APIs are properly tested and documented',
            type: 'weekly',
            level: 'individual',
            timeframe: 'weekly',
            startDate: '2024-01-15',
            endDate: '2024-01-21',
            ownerId: '4',
            ownerName: 'Alex Rodriguez',
            ownerRole: 'Backend Developer',
            department: 'Technology',
            status: 'at-risk',
            progress: 40,
            parentObjectiveId: '4',
            visibility: 'employees',
            alignmentPath: ['1', '2', '3', '4'],
            keyResults: [
                {
                    id: '5-1',
                    objectiveId: '5',
                    description: 'Complete 100% of API test cases',
                    targetValue: 100,
                    currentValue: 40,
                    unit: '%',
                    progress: 40,
                    status: 'at-risk',
                    kpis: [],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },

        // Daily Individual Tasks
        {
            id: '6',
            title: 'Verify Seller Accounts',
            description: 'Complete daily verification of new seller registrations',
            type: 'daily',
            level: 'individual',
            timeframe: 'daily',
            startDate: '2024-01-15',
            endDate: '2024-01-15',
            ownerId: '5',
            ownerName: 'Emma Wilson',
            ownerRole: 'Operations Specialist',
            department: 'Operations',
            status: 'completed',
            progress: 100,
            parentObjectiveId: '5',
            visibility: 'employees',
            alignmentPath: ['1', '2', '3', '4', '5'],
            keyResults: [
                {
                    id: '6-1',
                    objectiveId: '6',
                    description: 'Verify 5 seller accounts',
                    targetValue: 5,
                    currentValue: 5,
                    unit: 'accounts',
                    progress: 100,
                    status: 'completed',
                    kpis: [],
                    initiatives: []
                }
            ],
            initiatives: [],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        }
    ];

    private stats: GoalStats = {
        totalObjectives: 47,
        onTrack: 28,
        needsAttention: 12,
        atRisk: 5,
        completed: 2,
        alignmentScore: 85,
        departmentBreakdown: [
            { department: 'Sales', objectives: 12, progress: 78 },
            { department: 'Technology', objectives: 15, progress: 92 },
            { department: 'Operations', objectives: 8, progress: 65 },
            { department: 'Marketing', objectives: 7, progress: 71 },
            { department: 'HR', objectives: 5, progress: 88 }
        ]
    };

    async getObjectives(filters?: {
        type?: string;
        level?: string;
        timeframe?: string;
        status?: string;
        department?: string;
    }): Promise<Objective[]> {
        await new Promise(resolve => setTimeout(resolve, 600));

        let filtered = this.objectives;

        if (filters?.type && filters.type !== 'all') {
            filtered = filtered.filter(obj => obj.type === filters.type);
        }

        if (filters?.level && filters.level !== 'all') {
            filtered = filtered.filter(obj => obj.level === filters.level);
        }

        if (filters?.timeframe && filters.timeframe !== 'all') {
            filtered = filtered.filter(obj => obj.timeframe === filters.timeframe);
        }

        if (filters?.status && filters.status !== 'all') {
            filtered = filtered.filter(obj => obj.status === filters.status);
        }

        if (filters?.department && filters.department !== 'all') {
            filtered = filtered.filter(obj => obj.department === filters.department);
        }

        return filtered;
    }

    async getObjective(id: string): Promise<Objective | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.objectives.find(obj => obj.id === id) || null;
    }

    async getGoalStats(): Promise<GoalStats> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return this.stats;
    }

    async getObjectivesByLevel(level: Objective['level']): Promise<Objective[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.objectives.filter(obj => obj.level === level);
    }

    async getChildObjectives(parentId: string): Promise<Objective[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.objectives.filter(obj => obj.parentObjectiveId === parentId);
    }

    async createObjective(objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>): Promise<Objective> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const newObjective: Objective = {
            ...objective,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.objectives.push(newObjective);
        return newObjective;
    }

    async updateObjectiveProgress(id: string, progress: number): Promise<Objective> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const objective = this.objectives.find(obj => obj.id === id);
        if (!objective) {
            throw new Error('Objective not found');
        }

        objective.progress = progress;
        objective.updatedAt = new Date().toISOString();

        // Update status based on progress
        if (progress >= 80) objective.status = 'on-track';
        else if (progress >= 50) objective.status = 'needs-attention';
        else if (progress >= 30) objective.status = 'at-risk';
        else objective.status = 'off-track';

        if (progress >= 100) objective.status = 'completed';

        return objective;
    }
}

export const goalService = new GoalService();
