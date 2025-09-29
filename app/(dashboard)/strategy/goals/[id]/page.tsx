import { notFound } from 'next/navigation';
import { Goal, User } from '@/types';
import GoalViewClient from "@/components/sections/GoalViewClient";

// Mock data - replace with actual API calls
const mockGoal: Goal = {
    id: '1',
    title: 'Increase Annual Revenue',
    description: 'Achieve 25% growth in annual revenue through new client acquisition and service expansion',
    type: 'Company',
    category: 'Revenue',
    targetValue: 1000000,
    currentValue: 750000,
    unit: 'USD',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    ownerId: '1',
    ownerName: 'John CEO',
    status: 'In Progress',
    parentGoalId: null,
    keyResults: [
        {
            id: '1',
            description: 'Acquire 50 new enterprise clients',
            targetValue: 50,
            currentValue: 32,
            unit: 'clients',
            status: 'In Progress'
        }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01'
};

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'John CEO',
    email: 'ceo@company.com',
    role: 'CEO'
};

async function getGoal(id: string): Promise<Goal | null> {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(id === '1' ? mockGoal : null);
        }, 100);
    });
}

export async function generateStaticParams() {
    // Generate static params for build time
    return [{ id: '1' }];
}

export default async function GoalViewPage({ params }: { params: { id: string } }) {
    const goal = await getGoal(params.id);

    if (!goal) {
        notFound();
    }

    return <GoalViewClient goal={goal} user={mockUser} />;
}