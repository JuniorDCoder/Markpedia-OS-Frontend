import { notFound, redirect } from 'next/navigation';
import { QuickCapture, User, JournalEntry, Goal } from '@/types';
import ProcessJournalClient from "@/components/sections/ProcessJournalClient";

// Mock data - replace with actual API calls
const mockQuickCapture: QuickCapture = {
    id: '1',
    content: 'Consider adding dark mode to the mobile app - user requests increasing',
    tags: ['mobile', 'feature', 'ui'],
    authorId: '2',
    createdAt: '2024-01-15T08:20:00Z',
    processed: false
};

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Manager',
    department: 'Customer Support'
};
const mockGoals: Goal[] = [
    {
        id: '1',
        title: 'Increase Mobile App Engagement',
        description: 'Improve user engagement metrics for mobile applications',
        type: 'Company',
        category: 'Engagement',
        targetValue: 100,
        currentValue: 75,
        unit: '%',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        ownerId: '1',
        status: 'In Progress',
        parentGoalId: null,
        keyResults: []
    },
    {
        id: '2',
        title: 'Enhance User Experience',
        description: 'Improve overall user satisfaction and interface quality',
        type: 'Department',
        category: 'Quality',
        targetValue: 95,
        currentValue: 88,
        unit: '%',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        ownerId: '2',
        status: 'In Progress',
        parentGoalId: null,
        keyResults: []
    }
];

async function getQuickCapture(id: string): Promise<QuickCapture | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(id === '1' ? mockQuickCapture : null);
        }, 100);
    });
}

async function getGoals(): Promise<Goal[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockGoals);
        }, 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function ProcessJournalPage({ params }: { params: { id: string } }) {
    const quickCapture = await getQuickCapture(params.id);
    const goals = await getGoals();

    if (!quickCapture) {
        notFound();
    }

    if (quickCapture.processed) {
        redirect('/strategy/journal');
    }

    return <ProcessJournalClient quickCapture={quickCapture} goals={goals} user={mockUser} />;
}