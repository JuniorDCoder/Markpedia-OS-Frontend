import { JournalEntry, QuickCapture, JournalStats } from '@/types/journal';

const mockJournalEntries: JournalEntry[] = [
    {
        id: '1',
        title: 'New Supplier Onboarding Lessons',
        content: 'Documenting key lessons learned from the recent supplier onboarding process. Improved verification steps reduced errors by 40%.',
        category: 'Lesson',
        type: 'Team',
        tags: ['supplier', 'risk', 'onboarding'],
        createdBy: '1',
        authorName: 'Marie Ngu',
        department: 'Logistics',
        departmentId: 'dept-1',
        status: 'Published',
        visibilityLevel: 'Internal',
        sharedWith: ['2', '3', '4'],
        createdAt: '2024-10-08T10:30:00Z',
        updatedAt: '2024-10-08T10:30:00Z',
        sentiment: 'Positive'
    },
    {
        id: '2',
        title: 'Why Team Morale Dropped This Week',
        content: 'Analysis of recent team survey results showing concerns about workload distribution and communication gaps.',
        category: 'Reflection',
        type: 'Private',
        tags: ['morale', 'team-health', 'communication'],
        createdBy: '2',
        authorName: 'Joe Tassi',
        department: 'Operations',
        departmentId: 'dept-2',
        status: 'Draft',
        visibilityLevel: 'Private',
        sharedWith: [],
        createdAt: '2024-10-06T14:20:00Z',
        updatedAt: '2024-10-06T14:20:00Z',
        sentiment: 'Negative'
    },
    {
        id: '3',
        title: 'Pilot for AI Matching Engine',
        content: 'Initial results from the AI-powered candidate matching system pilot. 85% accuracy in first-round screening.',
        category: 'Pilot',
        type: 'Innovation',
        tags: ['innovation', 'AI', 'recruitment'],
        createdBy: '3',
        authorName: 'Ulrich Atem',
        department: 'Technology',
        departmentId: 'dept-3',
        status: 'Published',
        visibilityLevel: 'Internal',
        sharedWith: ['1', '4'],
        createdAt: '2024-10-05T09:15:00Z',
        updatedAt: '2024-10-05T09:15:00Z',
        sentiment: 'Positive'
    },
    {
        id: '4',
        title: 'Q4 Strategic Direction Update',
        content: 'Decision to pivot focus towards enterprise clients based on market analysis and customer feedback.',
        category: 'Decision',
        type: 'Decision',
        tags: ['strategy', 'enterprise', 'pivot'],
        createdBy: '4',
        authorName: 'Sarah Chen',
        department: 'Strategy',
        departmentId: 'dept-4',
        status: 'Published',
        visibilityLevel: 'Internal',
        sharedWith: ['1', '2', '3'],
        linkedDecisionId: 'dec-1',
        createdAt: '2024-10-03T16:45:00Z',
        updatedAt: '2024-10-03T16:45:00Z',
        sentiment: 'Neutral'
    },
    {
        id: '5',
        title: 'Automated Reporting Feature Idea',
        content: 'Client-requested feature for customizable dashboards and automated report generation.',
        category: 'Idea',
        type: 'Innovation',
        tags: ['feature', 'analytics', 'client-request'],
        createdBy: '5',
        authorName: 'Mike Rodriguez',
        department: 'Product',
        departmentId: 'dept-5',
        status: 'Draft',
        visibilityLevel: 'Internal',
        sharedWith: ['3', '4'],
        createdAt: '2024-10-01T11:20:00Z',
        updatedAt: '2024-10-01T11:20:00Z',
        sentiment: 'Positive'
    }
];

const mockQuickCaptures: QuickCapture[] = [
    {
        id: '1',
        content: 'Consider adding dark mode to mobile app - user requests increasing',
        tags: ['mobile', 'feature', 'ui'],
        authorId: '2',
        createdAt: '2024-10-15T08:20:00Z',
        processed: false
    },
    {
        id: '2',
        content: 'Team lunch next Friday to celebrate Q4 results',
        tags: ['team-building', 'celebration'],
        authorId: '1',
        createdAt: '2024-10-15T14:30:00Z',
        processed: true,
        convertedTo: 'meeting'
    }
];

const mockStats: JournalStats = {
    totalEntriesThisMonth: 12,
    publishedLessons: 8,
    ideasUnderValidation: 3,
    decisionMemosLogged: 2,
    averageSentiment: 4.2
};

export class JournalService {
    static async getJournalEntries(filters?: {
        type?: string;
        category?: string;
        status?: string;
        department?: string;
        tags?: string[];
    }): Promise<JournalEntry[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let entries = [...mockJournalEntries];

        if (filters?.type && filters.type !== 'all') {
            entries = entries.filter(entry => entry.type === filters.type);
        }

        if (filters?.category && filters.category !== 'all') {
            entries = entries.filter(entry => entry.category === filters.category);
        }

        if (filters?.status && filters.status !== 'all') {
            entries = entries.filter(entry => entry.status === filters.status);
        }

        if (filters?.department && filters.department !== 'all') {
            entries = entries.filter(entry => entry.department === filters.department);
        }

        return entries;
    }

    static async getQuickCaptures(): Promise<QuickCapture[]> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockQuickCaptures.filter(qc => !qc.processed);
    }

    static async getStats(): Promise<JournalStats> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockStats;
    }

    static async createQuickCapture(content: string, authorId: string, tags: string[] = []): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, this would call an API
        console.log('Quick capture created:', { content, authorId, tags });
    }
}